import React from "react";

export default function GlassCard({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag className={`glass-card p-5 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
