 
import { useState, useEffect } from "react";

export function useSplineLoader(url) {
    const [sceneUrl, setSceneUrl] = useState(null);

    useEffect(() => {
        console.log("Initializing Spline loader...");
        setSceneUrl(url);  
    }, [url]);

    return sceneUrl;
}
