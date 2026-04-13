"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    IconFingerprint, 
    IconMapPin, 
    IconClock, 
    IconAlertCircle, 
    IconCircleCheck, 
    IconRefresh,
    IconLoader2,
    IconTarget
} from "@tabler/icons-react";
import { usePortalAttendanceStatus, usePortalAttendanceMutations } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MarkAttendanceTabProps {
    employeeId: string;
    companyId: string;
}

export function MarkAttendanceTab({ employeeId, companyId }: MarkAttendanceTabProps) {
    const { data: status, isLoading: loadingStatus, refetch: fetchStatus } = usePortalAttendanceStatus();
    const { markAttendance } = usePortalAttendanceMutations();
    
    const [currentTime, setCurrentTime] = useState(new Date());
    const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [remark, setRemark] = useState("");
    const [locationError, setLocationError] = useState<string | null>(null);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchLocation = () => {
        setGettingLocation(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setGettingLocation(false);
                toast.success("Location acquired successfully.");
            },
            (error) => {
                let msg = "Failed to get location.";
                switch(error.code) {
                    case error.PERMISSION_DENIED: msg = "Location permission denied. Please allow location access to check in."; break;
                    case error.POSITION_UNAVAILABLE: msg = "Location information is unavailable."; break;
                    case error.TIMEOUT: msg = "Location request timed out."; break;
                }
                setLocationError(msg);
                setGettingLocation(false);
                toast.error(msg);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleMarkAttendance = async () => {
        if (status?.config?.requireLocation && !coords) {
            toast.error("Location is required. Please fetch your location first.");
            return;
        }

        try {
            await markAttendance.mutateAsync({
                latitude: coords?.latitude,
                longitude: coords?.longitude,
                remark: remark || undefined
            });
            // Force immediate status refetch
            await fetchStatus();
            setRemark("");
        } catch (error) {
            // Error handled by mutation hook
        }
    };

    if (loadingStatus) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <IconLoader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing attendance portal...</p>
            </div>
        );
    }

    const isCheckIn = status?.nextExpectedEvent === "IN";
    const allowSelfCheckIn = status?.config?.allowSelfCheckIn ?? false;
    const requireLocation = status?.config?.requireLocation ?? false;
    const lastEvent = status?.lastEvent;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Left Column: Action Card */}
            <Card className={cn(
                "lg:col-span-12 border border-neutral-200 dark:border-white/10 shadow-xl rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white dark:bg-neutral-900/50 relative p-2 md:p-4",
                !allowSelfCheckIn && "opacity-80 grayscale"
            )}>
                {!allowSelfCheckIn && (
                    <div className="absolute inset-0 z-20 bg-neutral-100/10 dark:bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 md:p-8 text-center">
                        <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-white/10 space-y-4 max-w-sm md:max-w-md">
                            <div className="h-12 w-12 md:h-16 md:w-16 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto">
                                <IconAlertCircle className="h-6 w-6 md:h-8 md:w-8" />
                            </div>
                            <h3 className="text-lg md:text-xl font-black">Self Check-in Disabled</h3>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium">
                                Your policy currently doesn't allow marking attendance via the portal. Please use a verified fingerprint device or contact your manager.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-4 sm:p-6 lg:p-12 relative z-10">
                    {/* Time & Clock Section */}
                    <div className="flex flex-col justify-center space-y-6 md:space-y-8">
                        <div className="space-y-2">
                             <Badge variant="outline" className="rounded-full px-4 py-1.5 h-auto text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-primary/20 bg-primary/5 text-primary">
                                {isCheckIn ? "Available for Check-in" : "Currently Active"}
                             </Badge>
                             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                                {isCheckIn ? "Good Day!" : "Have a productive day!"}
                             </h2>
                             {status?.activeShift && (
                                 <div className="flex items-center gap-2 mt-3 md:mt-4 text-primary font-black text-[10px] md:text-xs uppercase tracking-widest bg-primary/5 w-fit px-3 py-1.5 rounded-lg border border-primary/10">
                                     <IconClock className="h-3.5 w-3.5" />
                                     <span>{status.activeShift.name}</span>
                                     <span className="opacity-50 mx-1">•</span>
                                     <span className="opacity-70">{status.activeShift.startTime} - {status.activeShift.endTime}</span>
                                 </div>
                             )}
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter tabular-nums drop-shadow-sm">
                                    {format(currentTime, "HH:mm")}
                                </span>
                                <span className="text-xl sm:text-2xl font-bold opacity-50 tabular-nums">
                                    {format(currentTime, "ss")}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground font-black text-[10px] md:text-sm uppercase tracking-widest pl-1">
                                <IconClock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                {format(currentTime, "EEEE, MMMM do, yyyy")}
                            </div>
                        </div>

                        {lastEvent && (
                            <div className="p-4 sm:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 space-y-2 md:space-y-3">
                                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <IconCircleCheck className="h-3 w-3 text-green-500" />
                                    Last Activity recorded
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-base md:text-lg font-black">{lastEvent.type}</span>
                                    <span className="text-xs md:text-sm font-bold opacity-70">{format(new Date(lastEvent.time), "p")}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Section */}
                    <div className="flex flex-col justify-center space-y-6 md:pl-0 lg:pl-8">
                        <div className="space-y-3 md:space-y-4">
                            <Label className="text-[10px] md:text-sm font-black uppercase tracking-widest ml-1 opacity-70">Optional Remark</Label>
                            <Input 
                                placeholder="Add a note (e.g. Work from home...)"
                                className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-neutral-50/50 dark:bg-black/20 border-neutral-200 dark:border-white/10 font-bold px-4 md:px-6 focus:ring-primary/20 text-sm md:text-base"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                            />
                        </div>

                        {requireLocation && (
                            <div className={cn(
                                "p-4 sm:p-6 rounded-2xl md:rounded-3xl border transition-all duration-300",
                                coords 
                                    ? "bg-green-50/50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20" 
                                    : "bg-orange-50/50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/20"
                            )}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-9 w-9 md:h-10 md:w-10 rounded-xl flex items-center justify-center shadow-lg shrink-0",
                                            coords ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                                        )}>
                                            <IconMapPin className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">Location Status</span>
                                            <span className="text-[9px] md:text-[10px] font-bold opacity-70 truncate max-w-[120px] sm:max-w-[150px]">
                                                {coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : "Required to proceed"}
                                            </span>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="rounded-xl h-9 md:h-10 px-4 font-black text-[9px] md:text-[10px] uppercase gap-2 bg-white dark:bg-neutral-800 w-full sm:w-auto"
                                        onClick={fetchLocation}
                                        disabled={gettingLocation}
                                    >
                                        {gettingLocation ? <IconLoader2 className="h-3 w-3 animate-spin" /> : <IconTarget className="h-3 w-3" />}
                                        {coords ? "Update Location" : "Get Location"}
                                    </Button>
                                </div>
                                {locationError && (
                                    <p className="text-[9px] md:text-[10px] font-bold text-red-500 flex items-center gap-1">
                                        <IconAlertCircle className="h-3 w-3" />
                                        {locationError}
                                    </p>
                                )}
                            </div>
                        )}

                        <Button 
                            className={cn(
                                "h-20 md:h-24 rounded-[1.5rem] md:rounded-[2rem] text-lg md:text-xl font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95",
                                isCheckIn 
                                    ? "bg-primary text-primary-foreground shadow-primary/30" 
                                    : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
                            )}
                            disabled={markAttendance.isPending || (requireLocation && !coords)}
                            onClick={handleMarkAttendance}
                        >
                            {markAttendance.isPending ? (
                                <IconLoader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                <>
                                    <IconFingerprint className="h-6 w-6 md:h-8 md:w-8 mr-3 md:mr-4" />
                                    {isCheckIn ? "Mark Check-In" : "Mark Check-Out"}
                                </>
                            )}
                        </Button>
                        
                        <p className="text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                            Enforcing policy rules with secure biometric verification
                        </p>
                    </div>
                </div>
            </Card>

            {/* Support / Info Row */}
            <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                    { icon: IconTarget, title: "Zone Integrity", desc: "Geofencing ensures you are at a verified site.", color: "text-blue-500" },
                    { icon: IconFingerprint, title: "Single Identity", desc: "One device per legal identity enforced.", color: "text-purple-500" },
                    { icon: IconClock, title: "Time Sync", desc: "Synchronized with global network time servers.", color: "text-orange-500" },
                ].map((item, idx) => (
                    <Card key={idx} className="border border-neutral-200 dark:border-white/10 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-neutral-900/50 flex items-start gap-4">
                        <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-neutral-100 dark:bg-black/20 flex items-center justify-center shrink-0 shadow-inner", item.color)}>
                            <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="space-y-1 pt-1">
                            <h4 className="text-[11px] md:text-sm font-black uppercase tracking-tight">{item.title}</h4>
                            <p className="text-[10px] md:text-xs text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
