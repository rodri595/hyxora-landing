import { useState } from "react";

/**
 * Hook to create a Loops contact.
 * Returns { submit, loading, error, success, reset }
 */
export function useLoopsContact() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const reset = () => {
        setLoading(false);
        setError(null);
        setSuccess(false);
    };

    /**
     * @param {{ email: string, firstName?: string, lastName?: string, source?: string }} contactData
     */
    const submit = async (contactData) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch("/api/loops/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactData),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                // 409 means contact already exists — treat as success for UX
                if (res.status === 409) {
                    setSuccess(true);
                } else {
                    setError(data.message ?? "Algo salió mal. Inténtalo de nuevo.");
                }
            } else {
                setSuccess(true);
            }
        } catch {
            setError("Error de conexión. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return { submit, loading, error, success, reset };
}
