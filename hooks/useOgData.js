import { useQuery } from "@tanstack/react-query";

async function fetchOgData(url) {
    const res = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(url)}`
    );
    const data = await res.json();
    if (data.status === "success") return data.data;
    return null;
}

export function useOgData(url) {
    const { data: ogData = null, isLoading: loading } = useQuery({
        queryKey: ["og-data", url],
        queryFn: () => fetchOgData(url),
        enabled: !!url,
        staleTime: 1000 * 60 * 60 * 24,     // 24 hours
        gcTime: 1000 * 60 * 60 * 24 * 7,    // 7 days
        retry: false,
    });

    return { ogData, loading };
}
