import React, { useEffect, useMemo, useState } from "react";
import "../../SCSS/AdminStyles/AdminCommitees/Manage Committees.scss";

const MemberTableComponent = () => {
  const baseURL = import.meta.env.VITE_API_URL; // ex: http://localhost:5000/api
  const USERS_ENDPOINT = `${baseURL}/user/all`;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setErr("");

        const token = localStorage.getItem("token");

        const res = await fetch(USERS_ENDPOINT, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
          setErr(data?.message || "Failed to load members");
          setMembers([]);
          return;
        }

        const list = Array.isArray(data) ? data : data?.data || [];
        setMembers(list);
      } catch (e) {
        setErr("Server error while loading members");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [USERS_ENDPOINT]);

  // Split into 4 columns
  const columns = useMemo(() => {
    const cols = [[], [], [], []];
    members.forEach((m, idx) => cols[idx % 4].push(m));
    return cols;
  }, [members]);

  const maxRows = useMemo(
    () => Math.max(...columns.map((c) => c.length), 5),
    [columns]
  );

  if (loading) {
    return (
      <div className="commitee">
        <h3>Committee 1</h3>
        <p>Loading members...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="commitee">
        <h3>Committee 1</h3>
        <p style={{ color: "red" }}>{err}</p>
      </div>
    );
  }

  return (
    <div className="commitee">
      <h3>Committee 1</h3>
      <p>Assign members to committees (loaded from backend)</p>

      <table>
        <thead>
          <tr>
            <th><input type="text" placeholder="ENTER COMMITEE 1" /></th>
            <th><input type="text" placeholder="ENTER COMMITEE 2" /></th>
            <th><input type="text" placeholder="ENTER COMMITEE 3" /></th>
            <th><input type="text" placeholder="ENTER COMMITEE 4" /></th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td><br /></td><td><br /></td><td><br /></td><td><br /></td>
          </tr>

          {Array.from({ length: maxRows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => {
                const member = col[rowIndex];
                const value = member
                  ? `${member.name || ""} (${member.indexNo || member.email || ""})`
                  : "";
                return (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={value}
                      readOnly
                      placeholder={`Member ${rowIndex + 1}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberTableComponent;
