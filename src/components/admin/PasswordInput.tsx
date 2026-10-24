"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & { visibilityLabel?: string };

export function PasswordInput({ visibilityLabel = "senha", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const label = `${visible ? "Ocultar" : "Mostrar"} ${visibilityLabel}`;
  return <div className="admin-password-input">
    <input {...props} type={visible ? "text" : "password"} />
    <button type="button" aria-label={label} title={label} aria-controls={props.id} aria-pressed={visible} disabled={props.disabled} onClick={() => setVisible(current => !current)}>
      {visible ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
    </button>
  </div>;
}
