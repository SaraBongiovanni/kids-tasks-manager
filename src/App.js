import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

const EMOJI_TASKS = {
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
  "Stendere": "👕📌"
};

const MOMENTI = ["Mattino", "Pomeriggio", "Sera"];

function App() {
  const [page, setPage] = useState("main");

  // Stato iniziale per i bambini, punti e nomi/emoji
  const [children, setChildren] = useState([
    { name: "Bambino 1", emoji: "👧", punti: 0 },
    { name: "Bambino 2", emoji: "👦", punti: 0 }
  ]);

  // Impegni selezionati per bambino e momento
  const [selectedTasks, setSelectedTasks] = useState({
    0: { Mattino: [], Pomeriggio: [], Sera: [] },
    1: { Mattino: [], Pomeriggio: [], Sera: [] }
  });

  // Impegni completati per bambino e momento
  const [taskCompletion, setTaskCompletion] = useState({
    0: { Mattino: [], Pomeriggio: [], Sera: [] },
    1: { Mattino: [], Pomeriggio: [], Sera: [] }
  });

  // --- CARICAMENTO dati da localStorage all'avvio ---
  useEffect(() => {
    const savedChildren = localStorage.getItem("children");
    if (savedChildren) setChildren(JSON.parse(savedChildren));

    const savedSelectedTasks = localStorage.getItem("selectedTasks");
    if (savedSelectedTasks) setSelectedTasks(JSON.parse(savedSelectedTasks));

    const savedTaskCompletion = localStorage.getItem("taskCompletion");
    if (savedTaskCompletion) setTaskCompletion(JSON.parse(savedTaskCompletion));
  }, []);

  // --- SALVATAGGIO dati children su localStorage quando cambia ---
  useEffect(() => {
    localStorage.setItem("children", JSON.stringify(children));
  }, [children]);

  // --- SALVATAGGIO dati selectedTasks su localStorage quando cambia ---
  useEffect(() => {
    localStorage.setItem("selectedTasks", JSON.stringify(selectedTasks));
  }, [selectedTasks]);

  // --- SALVATAGGIO dati taskCompletion su localStorage quando cambia ---
  useEffect(() => {
    localStorage.setItem("taskCompletion", JSON.stringify(taskCompletion));
  }, [taskCompletion]);

  // Funzione per aggiungere bonus di 10 punti a un bambino
  const handleBonus = (index) => {
    const updated = [...children];
    updated[index].punti += 10;
    setChildren(updated);
  };

  // Funzione per togliere 10 punti a un bambino (non scende sotto 0)
  const handleMalus = (index) => {
    const updated = [...children];
    updated[index].punti = Math.max(0, updated[index].punti - 10);
    setChildren(updated);
  };

  // Reset totale punti bambini a 0
  const resetPunti = () => {
    const updated = [...children];
    updated.forEach((c) => (c.punti = 0));
    setChildren(updated);
  };

  // Funzione per spuntare / togliere spunta a un impegno e dare bonus se completati tutti
  const toggleTaskDone = (childId, momento, task) => {
    const updated = { ...taskCompletion };
    const taskList = updated[childId][momento];
    const index = taskList.indexOf(task);
    if (index === -1) {
      taskList.push(task);

      // Verifico se tutti gli impegni sono completati per quel momento e bambino
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

  // Cambia l’impegno selezionato per quel bambino e momento
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

  // Aggiungi un nuovo impegno personalizzato
  const addCustomTask = () => {
    if (customTask.trim() && !EMOJI_TASKS[customTask]) {
      EMOJI_TASKS[customTask] = "🔧";
      setCustomTask("");
    }
  };

  // Reset di tutti gli impegni fissati
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

          <div style={{ marginBottom: 10 }}>
            <strong>Bambino 1</strong><br />
            {Object.entries(EMOJI_TASKS).map(([task, emoji]) => (
              <button
                key={`0-${momento}-${task}`}
                onClick={() => toggleTask(0, momento, task)}
                style={{
                  marginRight: 10,
                  marginBottom: 5,
                  padding: "5px 10px",
                  fontWeight: selectedTasks[0][momento].includes(task) ? "bold" : "normal",
                  backgroundColor: selectedTasks[0][momento].includes(task) ? "#c8e6c9" : "#eeeeee",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                {emoji} {task}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 10 }}>
            <strong>Bambino 2</strong><br />
            {Object.entries(EMOJI_TASKS).map(([task, emoji]) => (
              <button
                key={`1-${momento}-${task}`}
                onClick={() => toggleTask(1, momento, task)}
                style={{
                  marginRight: 10,
                  marginBottom: 5,
                  padding: "5px 10px",
                  fontWeight: selectedTasks[1][momento].includes(task) ? "bold" : "normal",
                  backgroundColor: selectedTasks[1][momento].includes(task) ? "#c8e6c9" : "#eeeeee",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                {emoji} {task}
              </button>
            ))}
          </div>
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
