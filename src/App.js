import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

let EMOJI_TASKS = {
  "Apparecchiare": "🍽️",
  "Sparecchiare": "🧹",
  "Sistemare il bucato": "🧺",
  "Fare la lavatrice": "🧼",
  "Dare da mangiare al gatto": "🐱",
  "Dare da mangiare al cane": "🐶",
  "Fare la spesa": "🛒",
  "Vestirsi": "👕",
  "Mettersi il pigiama": "🛌",
  "Riordinare la cameretta": "🧸",
  "Riordinare la sala": "🛋️",
  "Riordinare il bagno": "🚽",
  "Sistemare il giardino": "🌳",
  "Stendere": "👕📌",
  "Lavarsi i denti": "🪥",
  "Fare i compiti": "📚"
};

const MOMENTI = ["Mattino", "Pomeriggio", "Sera"];

function App() {
  const [page, setPage] = useState("main");

  const [children, setChildren] = useState([
    { name: "Bambino 1", emoji: "👧", punti: 0 },
    { name: "Bambino 2", emoji: "👦", punti: 0 }
  ]);

  const [selectedTasks, setSelectedTasks] = useState({
    0: { Mattino: [], Pomeriggio: [], Sera: [] },
    1: { Mattino: [], Pomeriggio: [], Sera: [] }
  });

  const [taskCompletion, setTaskCompletion] = useState({
    0: { Mattino: [], Pomeriggio: [], Sera: [] },
    1: { Mattino: [], Pomeriggio: [], Sera: [] }
  });

  useEffect(() => {
    const savedChildren = localStorage.getItem("children");
    if (savedChildren) setChildren(JSON.parse(savedChildren));

    const savedSelectedTasks = localStorage.getItem("selectedTasks");
    if (savedSelectedTasks) setSelectedTasks(JSON.parse(savedSelectedTasks));

    const savedTaskCompletion = localStorage.getItem("taskCompletion");
    if (savedTaskCompletion) setTaskCompletion(JSON.parse(savedTaskCompletion));
  }, []);

  useEffect(() => {
    localStorage.setItem("children", JSON.stringify(children));
  }, [children]);

  useEffect(() => {
    localStorage.setItem("selectedTasks", JSON.stringify(selectedTasks));
  }, [selectedTasks]);

  useEffect(() => {
    localStorage.setItem("taskCompletion", JSON.stringify(taskCompletion));
  }, [taskCompletion]);

  const handleBonus = (index) => {
    const updated = [...children];
    updated[index].punti += 10;
    setChildren(updated);
  };

  const handleMalus = (index) => {
    const updated = [...children];
    updated[index].punti = Math.max(0, updated[index].punti - 10);
    setChildren(updated);
  };

  const resetPunti = () => {
    const updated = [...children];
    updated.forEach((c) => (c.punti = 0));
    setChildren(updated);
  };

  const toggleTaskDone = (childId, momento, task) => {
    const updated = { ...taskCompletion };
    const taskList = updated[childId][momento];
    const index = taskList.indexOf(task);
    if (index === -1) {
      taskList.push(task);

      if (
        selectedTasks[childId][momento].length > 0 &&
        selectedTasks[childId][momento].every(t => taskList.includes(t))
      ) {
        handleBonus(childId);
      }
    } else {
      taskList.splice(index, 1);
    }
    setTaskCompletion(updated);
  };

  return page === "main" ? (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>🌟 Bacheca Giornaliera</h1>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 30 }}>
        {children.map((child, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", padding: 20, borderRadius: 10, width: "45%", background: "#f0f0f0" }}>
            <input
              type="text"
              value={child.emoji}
              onChange={(e) => {
                const updated = [...children];
                updated[idx].emoji = e.target.value;
                setChildren(updated);
              }}
              style={{ fontSize: 30, width: 50, textAlign: "center", border: "none", background: "transparent" }}
            />
            <input
              type="text"
              value={child.name}
              onChange={(e) => {
                const updated = [...children];
                updated[idx].name = e.target.value;
                setChildren(updated);
              }}
              style={{ fontWeight: "bold", fontSize: 20, border: "none", background: "transparent" }}
            />
            <div style={{ marginTop: 20 }}>
              {MOMENTI.map((momento) => (
                <div key={momento}>
                  <strong>{momento}</strong>:
                  <ul>
                    {selectedTasks[idx][momento].length === 0 ? (
                      <li>Nessun impegno</li>
                    ) : (
                      selectedTasks[idx][momento].map((task) => (
                        <li key={task}>
                          <label>
                            <input
                              type="checkbox"
                              checked={taskCompletion[idx][momento].includes(task)}
                              onChange={() => toggleTaskDone(idx, momento, task)}
                            /> {EMOJI_TASKS[task] || "🔧"} {task}
                          </label>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <button onClick={() => handleBonus(idx)}>⭐ +10</button>
              <button onClick={() => handleMalus(idx)} style={{ marginLeft: 10 }}>❌ -10</button>
            </div>
            <div style={{ marginTop: 10 }}>
              <strong>Punti totali:</strong> {child.punti}
            </div>
          </div>
        ))}
      </div>
      <button onClick={resetPunti} style={{ marginTop: 30, padding: "10px 20px", backgroundColor: "#e53935", color: "white", borderRadius: 6, border: "none" }}>
        🔁 Reset Punti
      </button>
      <div style={{ marginTop: 30, textAlign: "center" }}>
        <button onClick={() => setPage("parent")} style={{ fontSize: 20, padding: 10, backgroundColor: "#2196f3", color: "white", borderRadius: 6, border: "none" }}>
          👩‍👦 Area Genitori
        </button>
      </div>
    </div>
  ) : (
    <ParentArea
      goToMain={() => setPage("main")}
      selectedTasks={selectedTasks}
      setSelectedTasks={setSelectedTasks}
    />
  );
}

function ParentArea({ goToMain, selectedTasks, setSelectedTasks }) {
  const [customTask, setCustomTask] = useState("");

  const toggleTask = (childId, momento, taskName) => {
    const currentList = selectedTasks[childId][momento] || [];
    const updated = { ...selectedTasks };
    if (currentList.includes(taskName)) {
      updated[childId][momento] = currentList.filter((t) => t !== taskName);
    } else {
      updated[childId][momento] = [...currentList, taskName];
    }
    setSelectedTasks(updated);
  };

  const addCustomTask = () => {
    if (customTask.trim() && !EMOJI_TASKS[customTask]) {
      EMOJI_TASKS[customTask] = "🔧";
      setCustomTask("");
    }
  };

  const deleteTask = (taskName) => {
    const { [taskName]: _, ...updatedTasks } = EMOJI_TASKS;
    EMOJI_TASKS = updatedTasks;

    const updated = { ...selectedTasks };
    Object.keys(updated).forEach((childId) => {
      MOMENTI.forEach((momento) => {
        updated[childId][momento] = updated[childId][momento].filter((t) => t !== taskName);
      });
    });
    setSelectedTasks(updated);
  };

  const resetImpegni = () => {
    setSelectedTasks({
      0: { Mattino: [], Pomeriggio: [], Sera: [] },
      1: { Mattino: [], Pomeriggio: [], Sera: [] }
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👩‍👧‍👦 Area Genitori - Imposta Impegni</h2>
      {MOMENTI.map((momento) => (
        <div key={momento} style={{ marginBottom: 20 }}>
          <h3>{momento}</h3>
          {[0, 1].map((childId) => (
            <div key={childId} style={{ marginBottom: 10 }}>
              <strong>{`Bambino ${childId + 1}`}</strong><br />
              {Object.entries(EMOJI_TASKS).map(([task, emoji]) => (
                <span key={`${childId}-${momento}-${task}`} style={{ display: "inline-block", marginRight: 10, marginBottom: 5 }}>
                  <button
                    onClick={() => toggleTask(childId, momento, task)}
                    style={{
                      padding: "5px 10px",
                      fontWeight: selectedTasks[childId][momento].includes(task) ? "bold" : "normal",
                      backgroundColor: selectedTasks[childId][momento].includes(task) ? "#c8e6c9" : "#eeeeee",
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      cursor: "pointer",
                      marginRight: 5
                    }}
                  >
                    {emoji} {task}
                  </button>
                  {emoji === "🔧" && (
                    <button onClick={() => deleteTask(task)} style={{ color: "red", background: "transparent", border: "none", cursor: "pointer" }}>
                      ❌
                    </button>
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
      <div>
        <input
          type="text"
          value={customTask}
          onChange={(e) => setCustomTask(e.target.value)}
          placeholder="Nuovo impegno"
          style={{ padding: 5, width: "200px", marginRight: 10 }}
        />
        <button onClick={addCustomTask} style={{ padding: "5px 10px" }}>➕ Aggiungi</button>
      </div>
      <button
        onClick={resetImpegni}
        style={{ marginTop: 20, backgroundColor: "#f44336", color: "white", padding: 10, border: "none", borderRadius: 6, cursor: "pointer" }}
      >
        🔁 Reset Impegni
      </button>
      <div style={{ marginTop: 30 }}>
        <button onClick={goToMain} style={{ padding: 10, cursor: "pointer" }}>🔙 Torna alla Bacheca</button>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
export default App;
