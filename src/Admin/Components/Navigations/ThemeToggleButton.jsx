import { useTheme } from "../../Contexts/ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
            {theme === "dark" ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-900" />}
        </button>
    );
};

export default ThemeToggleButton;
