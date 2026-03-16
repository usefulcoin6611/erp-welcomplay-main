import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useSettings<T>(url: string, initial: T) {
    const [formData, setFormData] = useState<T>(initial);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetch(url)
            .then((res) => res.json())
            .then((json) => {
                if (!cancelled && json.success && json.data) {
                    // Sanitize null values to empty strings to prevent React input warnings
                    const sanitized = Object.keys(json.data).reduce((acc, key) => {
                        acc[key as keyof T] = json.data[key] === null ? ('' as any) : json.data[key];
                        return acc;
                    }, {} as T);
                    setFormData(sanitized);
                }
            })
            .catch((err) => console.error("Error fetching settings:", err))
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [url]);

    const save = async (newData?: Partial<T>) => {
        try {
            const dataToSave = newData ? { ...formData, ...newData } : formData;
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSave),
            });
            const json = await res.json();
            if (json.success) {
                toast.success("Settings saved!");
                if (json.data) {
                    const sanitized = Object.keys(json.data).reduce((acc, key) => {
                        acc[key as keyof T] = json.data[key] === null ? ('' as any) : json.data[key];
                        return acc;
                    }, {} as T);
                    setFormData(sanitized);
                }
                return json.data;
            } else {
                toast.error(json.message || "Failed to save settings");
                return null;
            }
        } catch {
            toast.error("Failed to save settings");
            return null;
        }
    };

    return { formData, setFormData, save, loading };
}
