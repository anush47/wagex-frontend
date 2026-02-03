import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Company, CompanyFile } from "@/types/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconFile, IconX, IconUpload, IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface FilesTabProps {
    formData: Company;
    handleChange: (field: keyof Company, value: any) => void;
}

export function FilesTab({ formData, handleChange }: FilesTabProps) {
    const files = formData.files || [];

    const removeFile = (keyToRemove: string) => {
        const updatedFiles = files.filter(f => f.key !== keyToRemove);
        handleChange("files", updatedFiles);
    };

    const addMockFile = () => {
        // This Mock simulates adding a file since we don't have a real upload endpoint yet
        const newFile: CompanyFile = {
            key: `new-${Date.now()}`,
            name: `New Document ${files.length + 1}.pdf`,
            url: "#"
        };
        handleChange("files", [...files, newFile]);
    };

    return (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgb(0,0,0,0.3)] bg-white dark:bg-neutral-900/40 backdrop-blur-xl rounded-[2rem]">
            <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <IconFile className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">Company Files</CardTitle>
                </div>

                <Button size="lg" onClick={addMockFile} className="gap-2 rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                    <IconUpload className="h-5 w-5" />
                    Upload File
                </Button>
            </CardHeader>
            <CardContent className="p-8">
                {files.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {files.map((file) => (
                            <div key={file.key} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-xl transition-all duration-300 group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-neutral-900 flex items-center justify-center shrink-0 text-amber-500 shadow-sm">
                                        <IconFile className="h-7 w-7" />
                                    </div>
                                    <div className="truncate">
                                        <p className="font-bold text-base text-neutral-900 dark:text-neutral-100 truncate">{file.name}</p>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-500 font-medium hover:text-primary mt-1 flex items-center gap-1 transition-colors">
                                            Click to download
                                        </a>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                        asChild
                                    >
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            <IconDownload className="h-5 w-5" />
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => removeFile(file.key)}
                                    >
                                        <IconX className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2rem] bg-neutral-50/50 dark:bg-neutral-900/20 hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors cursor-pointer group" onClick={addMockFile}>
                        <div className="mx-auto h-20 w-20 rounded-3xl bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center text-neutral-300 group-hover:text-primary group-hover:scale-110 transition-all duration-500">
                            <IconUpload className="h-10 w-10" />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-neutral-900 dark:text-white">No files uploaded</h3>
                        <p className="mt-2 text-neutral-500 font-medium max-w-sm mx-auto">Upload important documents, contracts, or tax files here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
