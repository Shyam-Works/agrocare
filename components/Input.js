// components/Input.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  disabled = false,
  maxLength,
  minLength,
  pattern,
  icon: Icon,
  showPasswordToggle = false,
  error,
  helperText,
  size = "md", // sm, md, lg
  variant = "default", // default, glassmorphism
  className = "",
  labelClassName = "",
  inputClassName = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const actualType = showPasswordToggle && showPassword ? "text" : type;

  const baseInputClasses =
    "w-full border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:border-transparent";

  const variants = {
    default:
      "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-green-500",
    glassmorphism:
      "border-white/30 bg-white/0 text-white placeholder-gray-300 focus:ring-green-400 backdrop-blur-sm focus:scale-[1.001]",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-xs",
    lg: "text-sm",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const hasIcon = Icon || showPasswordToggle;
  const paddingLeft = Icon
    ? size === "lg"
      ? "pl-12"
      : "pl-10"
    : sizes[size].split(" ")[0];
  const paddingRight = showPasswordToggle
    ? size === "lg"
      ? "pr-12"
      : "pr-12"
    : sizes[size].split(" ")[1];

  const inputClasses = `
    ${baseInputClasses}
    ${variants[variant]}
    ${paddingLeft}
    ${paddingRight}
    ${sizes[size].split(" ")[1]}
    ${error ? "border-red-500 focus:ring-red-500" : ""}
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${inputClassName}
  `.trim();

  const labelClasses = `
    block font-medium mb-1
    ${labelSizes[size]}
    ${variant === "glassmorphism" ? "text-white" : "text-gray-700"}
    ${labelClassName}
  `.trim();

  const iconClasses = `
    absolute left-3 top-1/2 transform -translate-y-1/2
    ${variant === "glassmorphism" ? "text-gray-300" : "text-gray-400"}
    ${iconSizes[size]}
  `;

  const toggleClasses = `
    absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110
    ${
      variant === "glassmorphism"
        ? "text-gray-300 hover:text-white"
        : "text-gray-400 hover:text-gray-600"
    }
    ${iconSizes[size]}
    ${disabled ? "cursor-not-allowed opacity-50" : ""}
  `;

  return (
    <div className={className}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && <Icon className={iconClasses} />}

        <input
          name={name}
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={inputClasses}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {showPasswordToggle && (
          <div
            className={toggleClasses}
            onClick={() => !disabled && setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {helperText && !error && (
        <p
          className={`mt-1 text-xs ${
            variant === "glassmorphism" ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {helperText}
        </p>
      )}

      {maxLength && value && value.length === maxLength && (
        <div
          className={`flex justify-end mt-1 text-xs ${
            variant === "glassmorphism" ? "text-gray-300" : "text-gray-500"
          }`}
        >
          <span className="text-red-500">
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default Input;
