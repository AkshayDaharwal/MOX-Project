 
import { MODEL_SETTINGS } from "./constants";

export const getSplineConfig = () => {
 
    return {
        ...MODEL_SETTINGS,
        timeStamp: new Date().toISOString(),
    };
};
