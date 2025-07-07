import { useState, useEffect } from "react";

const moments = ["mattino", "pomeriggio", "sera"];
const maxChildren = 5;

const defaultTasks = [
  { id: 1, text: "Lavarsi i denti", emoji: "🪥" },
  { id: 2, text: "Vestirsi", emoji: "👕" },
  { id: 3, text: "Fare il letto", emoji: "🛏" },
  { id: 4, text: "Apparecchiare", emoji: "🍽" },
  { id: 5, text: "Sparecchiare", emoji: "🫑" },
  { id: 6, text: "Riordinare la cameretta", emoji: "🏠" },
  { id: 7, text: "Riordinare la sala", emoji: "🏡" },
  { id: 8, text: "Riordinare il bagno", emoji: "🚽" },
  { id: 9, text: "Fare la lavatrice", emoji: "🛃" },
  { id: 10, text: "Sistemare il bucato", emoji: "🧵" },
  { id: 11, text: "Sistemare il giardino", emoji: "🌿" },
  { id: 12, text: "Mettere il pigiama", emoji: "🥯" },
  { id: 13, text: "Fare i compiti", emoji: "📝" },
  { id: 14, text: "Pulire il divano", emoji: "🪶" },
  { id: 15, text: "Dare da mangiare al cane", emoji: "🐶" },
  { id: 16, text: "Dare da mangiare al gatto", emoji: "🐱" },
  { id: 17, text: "Sistemare il robot delle pulizie (Gigetto)", emoji: "🤖" }
];

export default function App() {
  // Bambini: array di { id, name, emoji }
  const [children, setChildren] = useState([
    { id: 1, name: "Nome bambino", emoji: "👦" },
  ]);

  // Tasks assegnati: { childId: { moment: [taskString] } }
  const [tasksByChild, setTasksByChild] = useState(() => {
    const obj = {};
    children.forEach((c) => {
      obj[c.id] = {};
      moments.forEach((m) => {
        obj[c.id][m] = [];
      });
    });
    return obj;
  });

  // Tasks completati: { childId: { moment: [taskString] } }
  const [completedTasks, setCompletedTasks] = useState(() => {
    const obj = {};
    children.forEach((c) => {
      obj[c.id] = {};
      moments.forEach((m) => {
        obj[c.id][m] = [];
      });
    });
    return obj;
  });

  // Punti per bambino
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem("points");
    if (saved) return JSON.parse(saved);
    const initial = {};
    children.forEach((c) => (initial[c.id] = 0));
    return initial;
  });

  // Momento selezionato per ogni bambino (per visualizzare i compiti)
  const [selectedMoment, setSelectedMoment] = useState(() => {
    const sel = {};
    children.forEach((c) => (sel[c.id] = null));
    return sel;
  });

  // Modalità pagina: "main" o "parent"
  const [page, setPage] = useState("main");

  // Compiti definiti da genitore
  const [assignedTasks, setAssignedTasks] = useState(defaultTasks);

  // Nuovo compito genitore
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskEmoji, setNewTaskEmoji] = useState("");

  // --- Sincronizza stato se cambia la lista dei bambini ---
  useEffect(() => {
    // Aggiorna tasksByChild
    setTasksByChild((old) => {
      const newObj = {};
      children.forEach((c) => {
        newObj[c.id] = {};
        moments.forEach((m) => {
          newObj[c.id][m] = old?.[c.id]?.[m] || [];
        });
      });
      return newObj;
    });

    // Aggiorna completedTasks
    setCompletedTasks((old) => {
      const newObj = {};
      children.forEach((c) => {
        newObj[c.id] = {};
        moments.forEach((m) => {
          newObj[c.id][m] = old?.[c.id]?.[m] || [];
        });
      });
      return newObj;
    });

    // Aggiorna punti
    setPoints((old) => {
      const newPts = {};
      children.forEach((c) => {
        newPts[c.id] = old?.[c.id] || 0;
      });
      return newPts;
    });

    // Aggiorna momento selezionato
    setSelectedMoment((old) => {
      const newSel = {};
      children.forEach((c) => {
        newSel[c.id] = old?.[c.id] || null;
      });
      return newSel;
    });
  }, [children]);

  // Salva punti su localStorage
  useEffect(() => {
    localStorage.setItem("points", JSON.stringify(points));
  }, [points]);

  // Reset automatico compiti completati e assegnati a mezzanotte
  useEffect(() => {
    const now = new Date();
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;

    const timer = setTimeout(() => {
      const emptyTasks = {};
      const emptyCompleted = {};
      children.forEach((c) => {
        emptyTasks[c.id] = {};
        emptyCompleted[c.id] = {};
        moments.forEach((m) => {
          emptyTasks[c.id][m] = [];
          emptyCompleted[c.id][m] = [];
        });
      });
      setTasksByChild(emptyTasks);
      setCompletedTasks(emptyCompleted);
    }, msToMidnight);

    return () => clearTimeout(timer);
  }, [children]);

  // --- Funzioni ---

  const addChild = () => {
    if (children.length >= maxChildren) return;
    const newChild = {
      id: Date.now(),
      name: "Nome bambino",
      emoji: "👦",
    };
    setChildren([...children, newChild]);
  };

  const removeChild = (id) => {
    if (children.length <= 1) return;
    setChildren(children.filter((c) => c.id !== id));
  };

  const updateChild = (id, field, val) => {
    setChildren(children.map(c => (c.id === id ? {...c, [field]: val} : c)));
  };

  const assignTaskToChild = (task, moment, childId) => {
    setTasksByChild(prev => {
      const currTasks = prev[childId][moment];
      const exists = currTasks.includes(task);
      const newTasks = exists
        ? currTasks.filter(t => t !== task)
        : [...currTasks, task];
      return {
        ...prev,
        [childId]: {
          ...prev[childId],
          [moment]: newTasks
        }
      };
    });

    // Rimuovi task completati se task rimosso
    setCompletedTasks(prev => {
      const doneTasks = prev[childId][moment];
      const newDone = doneTasks.filter(t => t !== task);
      return {
        ...prev,
        [childId]: {
          ...prev[childId],
          [moment]: newDone
        }
      };
    });
  };

  const toggleTaskDone = (childId, moment, task) => {
    setCompletedTasks(prev => {
      const doneTasks = prev[childId][moment];
      const isDone = doneTasks.includes(task);
      let newDone;
      if (isDone) {
        newDone = doneTasks.filter(t => t !== task);
      } else {
        newDone = [...doneTasks, task];
      }

      // Se completati tutti i task assegnati in quel momento -> +10 punti
      if (!isDone) {
        const assigned = tasksByChild[childId][moment] || [];
        if (newDone.length === assigned.length && assigned.length > 0) {
          setPoints(old => ({
            ...old,
            [childId]: (old[childId] || 0) + 10
          }));
        }
      }

      return {
        ...prev,
        [childId]: {
          ...prev[childId],
          [moment]: newDone
        }
      };
    });
  };

  const addBonusPoint = (childId) => {
    setPoints(old => ({
      ...old,
      [childId]: (old[childId] || 0) + 10,
    }));
  };

  const subtractPoint = (childId) => {
    setPoints(old => ({
      ...old,
      [childId]: Math.max((old[childId] || 0) - 10, 0),
    }));
  };

  const addNewTask = () => {
    if (!newTaskText.trim() || !newTaskEmoji.trim()) return;
    setAssignedTasks(old => [
      ...old,
      { id: Date.now(), text: newTaskText.trim(), emoji: newTaskEmoji.trim() }
    ]);
    setNewTaskText("");
    setNewTaskEmoji("");
  };

  // --- Render ---

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 1100, margin: "auto" }}>
      {page === "main" ? (
        <>
          <h1>Incarichi Bambini</h1>

          <div style={{ display: "flex", gap: 15 }}>
            {children.map(({ id, name, emoji }) => (
              <div
                key={id}
                style={{
                  flex: 1,
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 15,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 10, userSelect: "none" }}>
                  <input
                    type="text"
                    maxLength={2}
                    value={emoji}
                    onChange={(e) => updateChild(id, "emoji", e.target.value)}
                    style={{
                      fontSize: 40,
                      width: 50,
                      textAlign: "center",
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      cursor: "text",
                    }}
                    aria-label={`Emoji di ${name}`}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateChild(id, "name", e.target.value)}
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      flex: 1,
                      cursor: "text",
                    }}
                    aria-label={`Nome di ${name}`}
                  />
                  {children.length > 1 && (
                    <button
                      onClick={() => removeChild(id)}
                      style={{ cursor: "pointer" }}
                      title="Rimuovi bambino"
                    >
                      ❌
                    </button>
                  )}
                </div>

                <p><strong>Punti:</strong> {points[id] || 0}</p>

                <div>
                  <button onClick={() => addBonusPoint(id)}>⭐ Bonus +10</button>
                  <button onClick={() => subtractPoint(id)} style={{ marginLeft: 10 }}>💸 Multa -10</button>
                </div>

                <div style={{ marginTop: 10 }}>
                  {moments.map((moment) => (
                    <button
                      key={moment}
                      style={{
                        marginRight: 5,
                        background: selectedMoment[id] === moment ? "#d4edda" : "#eee",
                        border: "1px solid #999",
                        padding: "5px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedMoment(old => ({ ...old, [id]: moment }))}
                    >
                      {moment === "mattino" ? "☀️" : moment === "pomeriggio" ? "🌤️" : "🌙"} {moment}
                    </button>
                  ))}
                </div>

                <ul style={{ marginTop: 10, minHeight: 50 }}>
                  {(tasksByChild[id][selectedMoment[id]] || []).map((task, i) => (
                    <li key={i}>
                      <label>
                        <input
                          type="checkbox"
                          checked={(completedTasks[id][selectedMoment[id]] || []).includes(task)}
                          onChange={() => toggleTaskDone(id, selectedMoment[id], task)}
                        />{" "}
                        {task}
                      </label>
                    </li>
                  ))}
                  {selectedMoment[id] && tasksByChild[id][selectedMoment[id]].length === 0 && (
                    <p style={{ fontStyle: "italic", color: "#777" }}>Nessun compito assegnato.</p>
                  )}
                </ul>
              </div>
            ))}
          </div>

          {children.length < maxChildren && (
            <button
              onClick={addChild}
              style={{
                marginTop: 20,
                padding: "10px 20px",
                fontSize: 16,
                cursor: "pointer",
                borderRadius: 6,
                border: "1px solid #007bff",
                backgroundColor: "#007bff",
                color: "white",
              }}
            >
              ➕ Aggiungi bambino
            </button>
          )}

          <button
            style={{ marginTop: 20, display: "block" }}
            onClick={() => setPage("parent")}
          >
            👩‍👦 Area Genitore
          </button>
        </>
      ) : (
        <>
          <h1>Area Genitore</h1>

          <button onClick={() => setPage("main")} style={{ marginBottom: 20 }}>
            ← Torna indietro
          </button>

          <h2>Compiti disponibili</h2>
          <ul style={{ maxHeight: 150, overflowY: "auto", paddingLeft: 0, listStyle: "none" }}>
            {assignedTasks.map(({ id, text, emoji }) => (
              <li key={id} style={{ marginBottom: 8 }}>
                <label style={{ cursor: "pointer" }}>
                  {emoji} {text}
                </label>
              </li>
            ))}
          </ul>

          <h3>Aggiungi nuovo compito</h3>
          <div>
            <input
              type="text"
              placeholder="Testo compito"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              style={{ marginRight: 8, padding: 5 }}
            />
            <input
              type="text"
              placeholder="Emoji"
              maxLength={2}
              value={newTaskEmoji}
              onChange={(e) => setNewTaskEmoji(e.target.value)}
              style={{ width: 40, marginRight: 8, padding: 5, textAlign: "center" }}
            />
            <button onClick={addNewTask}>Aggiungi</button>
          </div>

          <h2>Assegna compiti ai bambini</h2>
          {children.map(({ id, name, emoji }) => (
            <div key={id} style={{ marginBottom: 20 }}>
              <h3>
                {emoji} {name}
              </h3>
              {moments.map((moment) => (
                <div key={moment} style={{ marginBottom: 8 }}>
                  <strong>
                    {moment === "mattino" ? "☀️ Mattino" : moment === "pomeriggio" ? "🌤️ Pomeriggio" : "🌙 Sera"}
                  </strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {assignedTasks.map(({ id: tid, text, emoji }) => {
                      const assigned = tasksByChild[id][moment].includes(text);
                      return (
                        <button
                          key={tid}
                          style={{
                            cursor: "pointer",
                            backgroundColor: assigned ? "#a2d5a2" : "#eee",
                            border: "1px solid #999",
                            borderRadius: 6,
                            padding: "4px 10px",
                            userSelect: "none",
                          }}
                          onClick={() => assignTaskToChild(text, moment, id)}
                        >
                          {emoji} {text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
