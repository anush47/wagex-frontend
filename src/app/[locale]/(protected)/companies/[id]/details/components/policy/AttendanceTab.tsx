"use client";

import { useEffect, useState } from "react";
import { AttendanceConfig, GeoZone, GeofencingEnforcement, ApprovalPolicyMode } from "@/types/policy";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconMapPin, IconDeviceMobile, IconUserCheck, IconKey, IconTrash, IconPlus, IconMap, IconCircleCheck, IconAlertTriangle, IconCopy } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

const AttendanceMap = dynamic(() => import("./AttendanceMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-2xl" />
});

interface AttendanceTabProps {
    value?: AttendanceConfig;
    onChange: (config: AttendanceConfig) => void;
}

const DEFAULT_ATTENDANCE_CONFIG: AttendanceConfig = {
    allowSelfCheckIn: true,
    requireLocation: true,
    requireDeviceInfo: true,
    geofencing: {
        enabled: false,
        enforcement: GeofencingEnforcement.FLAG_ONLY,
        zones: []
    },
    approvalPolicy: {
        mode: ApprovalPolicyMode.REQUIRE_APPROVAL_EXCEPTIONS,
        exceptionTriggers: {
            outsideZone: true,
            deviceMismatch: true,
            unrecognizedIp: false
        }
    },
    apiKeys: []
};


function ZoneEditor({ zones, onChange }: { zones: GeoZone[], onChange: (zones: GeoZone[]) => void }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [selectedName, setSelectedName] = useState("");
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);

    // Debounce search suggestions
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2 && showSuggestions && isAddingMode) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
                    const data = await response.json();
                    setSuggestions(data || []);
                } catch (error) {
                    console.error("Search suggestion error:", error);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, showSuggestions, isAddingMode]);

    const resolveAddress = async (lat: number, lng: number) => {
        setIsResolvingAddress(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const address = data.display_name || "Unknown Location";
            const shortName = address.split(',')[0];
            setSelectedName(shortName);
        } catch (e) {
            console.error("Geocoding error:", e);
            setSelectedName("Selected Location");
        } finally {
            setIsResolvingAddress(false);
        }
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        if (!isAddingMode) return;
        setSelectedLocation({ lat, lng });
        resolveAddress(lat, lng);
        // Note: We don't update userLocation here, as clicking map selects a *target* zone, not necessarily changing "my" location.
    };

    const handleAddZone = async () => {
        if (!selectedLocation) {
            toast.error("Please select a location on the map first");
            return;
        }

        const { lat, lng } = selectedLocation;
        const nameToUse = selectedName || "New Zone";

        try {
            // We already (potentially) have the name, but allow user to confirm or just use current
            const newZone: GeoZone = {
                id: uuidv4(),
                name: nameToUse,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, // Could store full address if we kept it
                latitude: lat,
                longitude: lng,
                radius: 100
            };

            onChange([...zones, newZone]);
            resetSelection();
            toast.success("Zone added successfully");
        } catch (error) {
            console.error("Error creating zone:", error);
            toast.error("Failed to add zone");
        }
    };

    const resetSelection = () => {
        setSelectedLocation(null);
        setSelectedName("");
        setSearchQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
        setIsAddingMode(false);
    };

    const handleSuggestionClick = (suggestion: any) => {
        const lat = parseFloat(suggestion.lat);
        const lng = parseFloat(suggestion.lon);
        const name = suggestion.display_name.split(',')[0];

        setMapCenter([lat, lng]);
        setSelectedLocation({ lat, lng });
        setSelectedName(name);
        setSearchQuery(suggestion.display_name); // Or keep it simple
        setShowSuggestions(false); // Hide dropdown
        setSuggestions([]);
    };

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowSuggestions(true);
    }

    // Legacy Enter key support if needed, but dropdown is preferred
    const handleManualSearch = async () => {
        if (!searchQuery || !isAddingMode) return;
        // Reuse the first suggestion logic if available, or fetch fresh
        if (suggestions.length > 0) {
            handleSuggestionClick(suggestions[0]);
        } else {
            // Fallback fetch
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    handleSuggestionClick(data[0]);
                } else {
                    toast.error("Location not found");
                }
            } catch (error) {
                console.error("Search error:", error);
            }
        }
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapCenter([latitude, longitude]);
                    setUserLocation({ lat: latitude, lng: longitude });
                    // Do NOT select it for adding zone automatically. Just show it as "Me".
                    toast.success("Location found");
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast.error("Could not get current location");
                }
            );
        } else {
            toast.error("Geolocation not supported");
        }
    };

    const removeZone = (id: string) => {
        onChange(zones.filter(z => z.id !== id));
    };

    const updateZoneRadius = (id: string, radius: number) => {
        onChange(zones.map(z => z.id === id ? { ...z, radius } : z));
    };

    return (
        <div className="space-y-4">
            <div className="relative h-[450px] w-full rounded-2xl overflow-hidden border border-border group">
                {/* Mode: Selection Active */}
                {isAddingMode && (
                    <>
                        {/* Overlay to indicate adding mode */}
                        <div className="absolute inset-x-0 top-0 h-1 z-[1001] bg-primary animate-pulse" />

                        {/* Controls Container - Top (Search) */}
                        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none animate-in fade-in slide-in-from-top-4">
                            <div className="flex gap-2 max-w-md shadow-2xl pointer-events-auto relative">
                                <div className="flex-1 relative">
                                    <Input
                                        value={searchQuery}
                                        onChange={handleSearchInput}
                                        onFocus={() => setShowSuggestions(true)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                                        placeholder="Search location to add..."
                                        className="bg-background/95 backdrop-blur-md border-border h-11 pl-4 pr-10 rounded-xl w-full text-sm shadow-sm"
                                        autoFocus
                                    />
                                    <Button onClick={handleManualSearch} size="sm" variant="ghost" className="absolute right-1 top-1 h-9 w-9">
                                        <IconMapPin className="h-4 w-4" />
                                    </Button>

                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden z-[1001] max-h-60 overflow-y-auto">
                                            {suggestions.map((item, index) => (
                                                <div key={index} onClick={() => handleSuggestionClick(item)} className="px-4 py-3 hover:bg-muted/50 cursor-pointer text-sm border-b border-border/50 last:border-none">
                                                    <p className="font-medium truncate">{item.display_name.split(',')[0]}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{item.display_name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button onClick={() => resetSelection()} size="icon" variant="destructive" className="h-11 w-11 rounded-xl shadow-lg" title="Cancel">
                                    <IconTrash className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="bg-primary/10 text-primary self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-primary/20 pointer-events-auto">
                                🖱️ Click on map to place zone
                            </div>
                        </div>

                        {/* Controls Container - Bottom Right (Add Action) */}
                        <div className="absolute bottom-4 right-4 z-[1000] pointer-events-none">
                            {selectedLocation && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 pointer-events-auto bg-background/95 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-border flex gap-2 items-center">
                                    <Input
                                        value={selectedName}
                                        onChange={(e) => setSelectedName(e.target.value)}
                                        placeholder="Name this zone"
                                        className="h-9 text-sm bg-transparent border-none focus-visible:ring-0 px-2 w-40"
                                        disabled={isResolvingAddress}
                                    />
                                    <Button onClick={handleAddZone} size="sm" className="h-9 rounded-lg px-4 gap-2 whitespace-nowrap" disabled={isResolvingAddress}>
                                        <IconPlus className="h-4 w-4" />
                                        Add
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Mode: Read-Only (Normal) */}
                {!isAddingMode && (
                    <div className="absolute bottom-4 right-4 z-[1000] animate-in fade-in slide-in-from-bottom-4">
                        <Button
                            onClick={() => setIsAddingMode(true)}
                            className="h-12 px-6 rounded-2xl shadow-2xl gap-2 font-bold text-sm bg-primary hover:bg-primary/90 transition-all border-none"
                        >
                            <IconPlus className="h-5 w-5" />
                            Add New Zone
                        </Button>
                    </div>
                )}

                {/* Always Visible Localize Me (Only in corner) */}
                <div className="absolute top-4 right-4 z-[1000]">
                    <Button onClick={handleCurrentLocation} size="icon" variant="secondary" className="h-10 w-10 rounded-xl shadow-lg bg-background/95 backdrop-blur-md hover:bg-background border border-border" title="Locate Me">
                        <IconDeviceMobile className="h-5 w-5" />
                    </Button>
                </div>

                <div className="h-full w-full z-0">
                    <AttendanceMap
                        center={mapCenter}
                        zones={zones}
                        onLocationSelect={handleLocationSelect}
                        selectedLocation={selectedLocation}
                        userLocation={userLocation}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active Zones</h4>
                {zones.length === 0 && (
                    <div className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-xl text-center">
                        No zones defined. Click on the map or search to add allowed locations.
                    </div>
                )}
                {zones.map(zone => (
                    <div key={zone.id} className="flex items-center gap-4 bg-muted/40 p-3 rounded-xl border border-border">
                        <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex-shrink-0">
                            <IconMap className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{zone.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{zone.address}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-background border px-2 py-1 rounded-md">
                                <span className="text-xs font-medium text-muted-foreground">Radius:</span>
                                <Input
                                    type="number"
                                    value={zone.radius}
                                    onChange={(e) => updateZoneRadius(zone.id, parseInt(e.target.value) || 0)}
                                    className="w-16 h-6 text-xs p-0 border-none text-right focus-visible:ring-0"
                                />
                                <span className="text-xs text-muted-foreground">m</span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeZone(zone.id)}
                            >
                                <IconTrash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AttendanceTab({ value, onChange }: AttendanceTabProps) {
    const config = value || DEFAULT_ATTENDANCE_CONFIG;

    const handleUpdate = (updates: Partial<AttendanceConfig>) => {
        onChange({ ...config, ...updates });
    };

    const handleGeofenceUpdate = (updates: Partial<typeof config.geofencing>) => {
        handleUpdate({
            geofencing: { ...config.geofencing, ...updates }
        });
    };

    const handleApprovalUpdate = (updates: Partial<typeof config.approvalPolicy>) => {
        handleUpdate({
            approvalPolicy: { ...config.approvalPolicy, ...updates }
        });
    };

    const [showManualKeyInput, setShowManualKeyInput] = useState(false);
    const [manualKeyName, setManualKeyName] = useState("");
    const [manualKeyValue, setManualKeyValue] = useState("");

    const handleAddManualKey = () => {
        if (!manualKeyName || !manualKeyValue) return;

        const newKey = {
            id: uuidv4(),
            name: manualKeyName,
            key: manualKeyValue,
            createdAt: new Date().toISOString()
        };

        handleUpdate({ apiKeys: [...config.apiKeys, newKey] });

        setManualKeyName("");
        setManualKeyValue("");
        setShowManualKeyInput(false);
        toast.success("API Key added");
    };

    const generateApiKey = () => {
        const newKey = {
            id: uuidv4(),
            name: `Device Key ${config.apiKeys.length + 1}`,
            key: `wk_${uuidv4().replace(/-/g, '')}`,
            createdAt: new Date().toISOString()
        };
        handleUpdate({ apiKeys: [...config.apiKeys, newKey] });
        toast.success("New API Key generated");
    };

    const deleteApiKey = (id: string) => {
        handleUpdate({ apiKeys: config.apiKeys.filter(k => k.id !== id) });
    };

    const updateApiKeyName = (id: string, name: string) => {
        handleUpdate({
            apiKeys: config.apiKeys.map(k => k.id === id ? { ...k, name } : k)
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Access Rules */}
            <Card className="border-none shadow-none bg-muted/50 rounded-3xl">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <IconDeviceMobile className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Device & Access Rules</span>
                    </div>
                    <CardDescription className="ml-7">Control how and where employees can check in.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 pt-4">
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl border-none shadow-sm">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold">Self Check-In</Label>
                            <p className="text-xs text-muted-foreground">Allow employees to use their own devices.</p>
                        </div>
                        <Switch
                            checked={config.allowSelfCheckIn}
                            onCheckedChange={(v) => handleUpdate({ allowSelfCheckIn: v })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background rounded-xl border-none shadow-sm">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold">Require GPS Location</Label>
                            <p className="text-xs text-muted-foreground">Mandatory location access for check-in.</p>
                        </div>
                        <Switch
                            checked={config.requireLocation}
                            onCheckedChange={(v) => handleUpdate({ requireLocation: v })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background rounded-xl border-none shadow-sm md:col-span-2">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold">Device Fingerprinting</Label>
                            <p className="text-xs text-muted-foreground">Record IP address, device model, and OS version for every punch.</p>
                        </div>
                        <Switch
                            checked={config.requireDeviceInfo}
                            onCheckedChange={(v) => handleUpdate({ requireDeviceInfo: v })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Geofencing */}
            <Card className="border-none shadow-none bg-muted/50 rounded-3xl overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <IconMapPin className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Geofencing Zones</span>
                        </div>
                        <Switch
                            checked={config.geofencing.enabled}
                            onCheckedChange={(v) => handleGeofenceUpdate({ enabled: v })}
                        />
                    </div>
                    <CardDescription className="ml-7">Restrict attendance to specific worksites.</CardDescription>
                </CardHeader>
                {config.geofencing.enabled && (
                    <CardContent className="space-y-6 pt-4">
                        <div className="p-4 bg-background rounded-xl border-none shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="flex gap-3">
                                <IconAlertTriangle className="h-5 w-5 text-muted-foreground" />
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm">Enforcement Policy</h4>
                                    <p className="text-xs text-muted-foreground">Action when outside zone</p>
                                </div>
                            </div>
                            <Select
                                value={config.geofencing.enforcement}
                                onValueChange={(v) => handleGeofenceUpdate({ enforcement: v as GeofencingEnforcement })}
                            >
                                <SelectTrigger className="bg-muted/50 border-none h-10 w-full md:w-64">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                    <SelectItem value={GeofencingEnforcement.FLAG_ONLY}>Allow but Flag</SelectItem>
                                    <SelectItem value={GeofencingEnforcement.STRICT}>Strictly Block</SelectItem>
                                    <SelectItem value={GeofencingEnforcement.NONE}>Log Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <ZoneEditor
                            zones={config.geofencing.zones}
                            onChange={(zones) => handleGeofenceUpdate({ zones })}
                        />
                    </CardContent>
                )}
            </Card>

            {/* Approval Workflow */}
            <Card className="border-none shadow-none bg-muted/50 rounded-3xl">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <IconCircleCheck className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Approval Workflow</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            {
                                val: ApprovalPolicyMode.AUTO_APPROVE,
                                label: "Auto Approve All",
                                desc: "Lowest security."
                            },
                            {
                                val: ApprovalPolicyMode.REQUIRE_APPROVAL_EXCEPTIONS,
                                label: "By Exception",
                                desc: "Recommended."
                            },
                            {
                                val: ApprovalPolicyMode.REQUIRE_APPROVAL_ALL,
                                label: "Manual Approval",
                                desc: "High security."
                            },
                        ].map((opt) => (
                            <div
                                key={opt.val}
                                onClick={() => handleApprovalUpdate({ mode: opt.val })}
                                className={cn(
                                    "cursor-pointer rounded-xl p-4 transition-all shadow-sm",
                                    config.approvalPolicy.mode === opt.val
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "bg-background hover:bg-muted/80"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm">{opt.label}</span>
                                    {config.approvalPolicy.mode === opt.val && <IconCircleCheck className="h-5 w-5" />}
                                </div>
                                <p className={cn("text-xs leading-relaxed", config.approvalPolicy.mode === opt.val ? "text-primary-foreground/80" : "text-muted-foreground")}>{opt.desc}</p>
                            </div>
                        ))}
                    </div>

                    {config.approvalPolicy.mode === ApprovalPolicyMode.REQUIRE_APPROVAL_EXCEPTIONS && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide text-xs pl-1">Trigger Approval For</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-background rounded-xl p-4 border border-border shadow-sm flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold">Outside Geo-Zone</Label>
                                        <p className="text-xs text-muted-foreground">Flag check-ins from unknown locations</p>
                                    </div>
                                    <Switch
                                        checked={config.approvalPolicy.exceptionTriggers.outsideZone}
                                        onCheckedChange={(v) => handleApprovalUpdate({
                                            exceptionTriggers: { ...config.approvalPolicy.exceptionTriggers, outsideZone: v }
                                        })}
                                    />
                                </div>
                                <div className="bg-background rounded-xl p-4 border border-border shadow-sm flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold">Unrecognized Device</Label>
                                        <p className="text-xs text-muted-foreground">Flag device mismatches</p>
                                    </div>
                                    <Switch
                                        checked={config.approvalPolicy.exceptionTriggers.deviceMismatch}
                                        onCheckedChange={(v) => handleApprovalUpdate({
                                            exceptionTriggers: { ...config.approvalPolicy.exceptionTriggers, deviceMismatch: v }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* API Keys */}
            <Card className="border-none shadow-none bg-muted/50 rounded-3xl">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <IconKey className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Device API Keys</span>
                    </div>
                    <CardDescription className="ml-7">Secure tokens for kiosks or biometric devices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    {config.apiKeys.length > 0 ? (
                        <div className="grid gap-3">
                            {config.apiKeys.map(apiKey => (
                                <div key={apiKey.id} className="flex items-start justify-between p-3 bg-background rounded-xl shadow-sm gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={apiKey.name}
                                            onChange={(e) => updateApiKeyName(apiKey.id, e.target.value)}
                                            className="h-8 font-semibold text-sm border-transparent hover:border-border focus:border-primary px-0 bg-transparent"
                                            placeholder="Key Name (e.g. Lobby Tablet)"
                                        />
                                        <div className="flex items-center gap-2">
                                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono text-muted-foreground">{apiKey.key}</code>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(apiKey.key);
                                                    toast.success("API Key copied to clipboard");
                                                }}
                                                title="Copy API Key"
                                            >
                                                <IconCopy className="h-3 w-3" />
                                            </Button>
                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold">Active</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1" onClick={() => deleteApiKey(apiKey.id)}>
                                        <IconTrash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground bg-background/50 rounded-xl border border-dashed border-muted-foreground/20">
                            No API Keys generated yet.
                        </div>
                    )}

                    {/* Manual Key Entry Form */}
                    {showManualKeyInput ? (
                        <div className="bg-background/50 border border-dashed border-primary/30 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Add Existing Key</h4>
                                <Button variant="ghost" size="sm" onClick={() => setShowManualKeyInput(false)} className="h-6 text-xs hover:bg-transparent text-muted-foreground hover:text-foreground">Cancel</Button>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Device Name (e.g. Warehouse Tablet)"
                                    value={manualKeyName}
                                    onChange={(e) => setManualKeyName(e.target.value)}
                                    className="bg-background"
                                />
                                <Input
                                    placeholder="API Key Value (wk_...)"
                                    value={manualKeyValue}
                                    onChange={(e) => setManualKeyValue(e.target.value)}
                                    className="font-mono text-sm bg-background"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                                <Button
                                    size="sm"
                                    onClick={handleAddManualKey}
                                    disabled={!manualKeyName || !manualKeyValue}
                                >
                                    Add Key
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={generateApiKey} variant="outline" className="h-11 rounded-xl border-dashed border-2 hover:bg-background hover:border-solid hover:border-primary/50 transition-all">
                                <IconPlus className="h-4 w-4 mr-2" />
                                Generate New
                            </Button>
                            <Button onClick={() => setShowManualKeyInput(true)} variant="outline" className="h-11 rounded-xl border-dashed border-2 hover:bg-background hover:border-solid hover:border-primary/50 transition-all">
                                <IconKey className="h-4 w-4 mr-2" />
                                Add Existing
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
