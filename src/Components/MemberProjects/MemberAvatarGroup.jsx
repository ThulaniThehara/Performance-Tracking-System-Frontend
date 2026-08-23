import React from "react";
import { useTranslation } from "react-i18next";

const MemberAvatarGroup = ({ members = [], max = 4 }) => {
  const { t } = useTranslation();
  const defaultList = [
    { name: "Asiri Hariss", bg: "#6b52d1" },
    { name: "Kasun Perera", bg: "#9d7bf0" },
    { name: "Nimal Silva", bg: "#4b2f61" },
    { name: "Dilini Gamage", bg: "#1d1545" },
    { name: "Saman Kumara", bg: "#8b6ef3" },
  ];

  const list = members.length > 0 ? members : defaultList;
  const visible = list.slice(0, max);
  const remaining = list.length - max;

  const getInitials = (nameStr) => {
    if (!nameStr) return "M";
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  return (
    <div className="member-avatar-group" style={{ display: "flex", alignItems: "center" }}>
      {visible.map((m, idx) => (
        <div
          key={m._id || m.id || idx}
          className="avatar-circle"
          title={m.name || m.username || t('memberProjects.avatarGroup.teamMember')}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: m.bg || "#6b52d1",
            color: "#ffffff",
            fontSize: "0.75rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #ffffff",
            marginLeft: idx === 0 ? 0 : -10,
            boxShadow: "0 2px 6px rgba(107, 82, 209, 0.2)",
          }}
        >
          {m.avatar ? (
            <img
              src={m.avatar}
              alt={m.name || t('memberProjects.avatarGroup.member')}
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            getInitials(m.name || m.username)
          )}
        </div>
      ))}

      {remaining > 0 && (
        <div
          className="avatar-more-count"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#eae2f8",
            color: "#6b52d1",
            fontSize: "0.72rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #ffffff",
            marginLeft: -10,
            boxShadow: "0 2px 6px rgba(107, 82, 209, 0.12)",
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default MemberAvatarGroup;
