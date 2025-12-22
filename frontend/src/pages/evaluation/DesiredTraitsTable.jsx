import React, { useEffect, useState } from "react";
import api from "../../api/api";
import "../../styles/DesiredTraitsTable.css";

export default function DesiredTraitsTable() {
  const classroomId = 1; // จากระบบจริง
  const teacherId = 1;   // จาก auth

  const indicators = [
    { key: "1.1", label: "มีน้ำหนักตามเกณฑ์" },
    { key: "1.2", label: "มีส่วนสูงตามเกณฑ์" }
  ];

  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    api.get(`/teacher/classroom/${classroomId}/children`)
      .then(res => setStudents(res.data));
  }, []);

  const setScore = (childId, key, value) => {
    setScores(prev => ({
      ...prev,
      [childId]: {
        ...(prev[childId] || {}),
        [key]: Number(value)
      }
    }));
  };

  const handleSave = async () => {
    const payload = {
      teacher_id: teacherId,
      classroom_id: classroomId,
      term: "1",
      year: 2567,
      scores: []
    };

    students.forEach(st => {
      indicators.forEach(ind => {
        const sc = scores[st.child_id]?.[ind.key];
        if (sc) {
          payload.scores.push({
            child_id: st.child_id,
            indicator_key: ind.key,
            score: sc
          });
        }
      });
    });

    await api.post("/evaluations", payload);
    alert("บันทึกผลการประเมินเรียบร้อย");
  };

  return (
    <div className="desired-traits">
      <h3 style={{ textAlign: "center" }}>
        แบบบันทึกมาตรฐานคุณลักษณะที่พึงประสงค์
      </h3>

      <table className="desired-table">
        <thead>
          <tr>
            <th>เลขที่</th>
            <th>ชื่อ – สกุล</th>
            {indicators.map(i => (
              <th key={i.key}>
                <div className="rotate">{i.label}</div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {students.map((st, idx) => (
            <tr key={st.child_id}>
              <td>{idx + 1}</td>
              <td className="left">{st.name}</td>
              {indicators.map(i => (
                <td key={i.key}>
                  <select
                    onChange={e =>
                      setScore(st.child_id, i.key, e.target.value)
                    }
                  >
                    <option value="">-</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleSave} style={{ marginTop: 12 }}>
        บันทึกผลการประเมิน
      </button>
    </div>
  );
}
