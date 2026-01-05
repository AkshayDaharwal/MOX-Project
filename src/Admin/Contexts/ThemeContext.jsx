import { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("lite");

    useEffect(() => {
        setTheme("lite");
        // No localStorage or global document changes
    }, []);

    return (
        <ThemeContext.Provider value={{ theme }}>
            {/* Add className="lite" only when theme is lite */}
            <div className={theme === "lite" ? "lite" : ""}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
