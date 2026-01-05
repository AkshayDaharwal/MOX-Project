// ModelWrapper.jsx
import React from "react";
import Spline from "@splinetool/react-spline";
import { SPLINE_SCENE_URL } from "./constants";
import { useSplineLoader } from "./hooks";
import { getSplineConfig } from "./SplineConfig";
import { logModelConfig } from "./helpers";

export default function ModelWrapper() {
    const sceneUrl = useSplineLoader(SPLINE_SCENE_URL);
    const config = getSplineConfig();

    logModelConfig(config);

    if (!sceneUrl) return <div>Loading...</div>;

    return (
        <div className="h-full">
            <Spline scene={sceneUrl} />
        </div>
    );
}
