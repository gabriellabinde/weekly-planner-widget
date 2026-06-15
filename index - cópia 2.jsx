// ==========================================
// ฅ^•ﻌ•^ฅ  WEEKLY PLANNER WIDGET
// BY GABRIELLA BINDE • MAY 2026
// ==========================================

// Refresh widget every 5 seconds
export const refreshFrequency = false; // Frequency rate in milliseconds.

// No shell command required.
// Data persistance is handled through localStorage, so we can leave the command empty.
export const command = "";

// Enable mouse and keyboard interaction
export const interact = true;

// ==========================================
// 🎨 STYLES AND COLORS
// ==========================================

export const className = `
/* 1. Importing fonts */
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');

/* 2. Global box-sizing rule */
  * { box-sizing: border-box; }

/* 3. Defining a local personalized font */

  @font-face {
    font-family: 'PixelOperatorMono';
    src: url('https://static.wfonts.com/data/2016/05/01/pixel-operator-mono/PixelOperatorMono.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
`;

const DAYS_WEEK = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];

const CAT_COLORS = {
  c:"#F9CAEF",
  a:"#B8F0E8",
  t:"#FFF3A3",
  l:"#d4b8F0",
  ad:"#FFD3AD",
  d:"#B8D8FF"
};

const CAT_BORDER_COLORS = {
  c:"#D995C9",
  a:"#78D6CA",
  t:"#E4D35E",
  l:"#8F73D9",
  ad:"#E8A66B",
  d:"#77A8E8"
};

const CAT_NAMES = {
  c:"CLINIC",
  a:"ACADEMIC",
  t:"WORKOUT",
  l:"LEISURE",
  ad:"ADMINISTRATIVE",
  d:"DOMESTIC LIFE"
};

const KEY_HINTS = {
  t: "WORKOUT [W]",
  a: "ACADEMIC [A]",
  c: "CLINIC [C]",
  l: "LEISURE [L]",
  ad: "ADMINISTRATIVE [M]",
  d: "DOMESTIC LIFE [D]"
};

const CAT_KEYS = ["t","a","c","ad","d","l"];

const HABIT_COLORS = ["#FFF3A3", "#B8F0E8", "#F9CAEF", "#FFD3AD", "#B8D8FF", "#D4B8F0"];

// Calculates the start date of a week based on an offset (0 = current, 1 = next, -1 = previous)

function getWeekStart(offset) {
  const today = new Date();
  const dow = today.getDay();

// Adjust to Monday: if Sunday (0), go back 6 days; otherwise, return to Monday
  const diff = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(today);
  mon.setDate(today.getDate() + diff + offset * 7);
  mon.setHours(0,0,0,0); // Resets time to midnight
  return mon;
}
// Returns a unique ID for the week based on its start date (e.g., "2026-5-1")
function weekKey(offset) {
  const d = getWeekStart(offset);
  return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

// Calculates the ISO week number (1 to 52/53) for a given date
function isoWeek(d) {
  const date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - (date.getDay()+6)%7);
  const w1 = new Date(date.getFullYear(),0,4);
  return 1 + Math.round(((date-w1)/86400000 - 3 + (w1.getDay()+6)%7)/7);
}

// Formats a date to a clean string, like "01 JUN"
function fmtDate(d) {
  const m = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return String(d.getDate()).padStart(2,"0") + " " + m[d.getMonth()];
}

/**
 * Creates the default structure for a new week.
 */
function initWeek() {
  return {
    // Array with 7 empty slots, one for each day of the week
    tasks: Array.from({ length: 7 }, () => []),

    // 6 habits, each with 7 days initialized as 'false'
    habits: Array.from({ length: 6 }, () => Array(7).fill(false)),

    // 6 empty strings for habit titles
    habitNames: Array(6).fill(""),

    // Empty list for general notes
    notes: []
  };
}

function saveData(allData, offset) {
  try {
    localStorage.setItem("weeklyPlannerData", JSON.stringify({data: allData, offset: offset}));
  } catch(e) {}
}

function getOffset(parsed) {
  try {
    return typeof parsed.offset === "number" ? parsed.offset : 0;
  } catch(e) {
    return 0;
  }
}

const pixel = (matrix, palette, size) => (
  <div style={{
    display:"grid",
    gridTemplateColumns:`repeat(${matrix[0].length}, ${size}px)`,
    gap:"0px",
    flexShrink:0
  }}>
    {matrix.flat().map(function(cell,i){
      return (
        <div
          key={i}
          style={{
            width:size+"px",
            height:size+"px",
            background:palette[cell] || "transparent"
          }}
        />
      );
    })}
  </div>
);

const PixelHeart = () => {
  const T=0, P=1, L=2;
  return pixel([
    [T,P,P,T,P,P,T],
    [P,L,L,P,L,L,P],
    [P,L,L,L,L,L,P],
    [T,P,L,L,L,P,T],
    [T,T,P,L,P,T,T],
    [T,T,T,P,T,T,T],
  ], {
    [T]:"transparent",
    [P]:"#f472b6",
    [L]:"#f9a8d4",
  }, 3);
};

const PixelHeartSmall = () => {
  const T=0, P=1;
  return pixel([
    [T,P,T,P,T],
    [P,P,P,P,P],
    [P,P,P,P,P],
    [T,P,P,P,T],
    [T,T,P,T,T],
  ], {
    [T]:"transparent",
    [P]:"#f472b6",
  }, 2);
};

const PixelPlant = () => {
  const T=0, LG=1, G=2, DG=3, LP=4, P=5, DP=6, W=7, F=8, SH=9;

  return pixel([
    [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
    [T,T,T,T,T,T,T,LG,T,T,T,T,T,T,T,T,T,T,T,T],
    [T,T,T,T,T,T,LG,LG,LG,T,T,T,T,T,T,T,T,T,T,T],
    [T,T,T,T,T,LG,LG,LG,T,T,T,LG,T,T,T,T,T,T,T,T],
    [T,T,T,T,T,T,LG,LG,DG,T,LG,LG,LG,T,T,T,T,T,T,T],
    [T,T,T,T,T,T,T,T,DG,G,LG,LG,LG,T,T,T,T,T,T,T],
    [T,T,T,T,T,T,LG,LG,LG,DG,G,T,T,T,T,LG,LG,T,T,T],
    [T,T,T,T,T,T,T,LG,LG,LG,DG,G,T,T,LG,LG,LG,T,T,T],
    [T,T,T,T,T,T,T,T,T,LG,DG,G,T,T,LG,T,LG,LG,T,T],
    [T,T,T,T,T,T,T,LG,LG,LG,G,DG,G,T,LG,LG,LG,T,T,T],
    [T,T,T,T,T,T,T,T,LG,LG,LG,DG,G,LG,LG,LG,T,T,T,T],
    [T,T,T,T,T,T,T,T,T,T,G,DG,G,T,T,T,T,T,T,T],
    [T,T,T,T,T,T,T,T,T,T,T,G,T,T,T,T,T,T,T,T],
    [T,T,T,T,T,T,T,T,T,T,T,G,T,T,T,T,T,T,T,T],
    [T,T,T,T,T,T,T,T,T,T,T,G,T,T,T,T,T,T,T,T],
    [T,T,T,T,T,T,LP,LP,LP,LP,LP,LP,LP,LP,LP,W,T,T,T,T],
    [T,T,T,T,T,T,P,LP,LP,LP,LP,LP,LP,LP,LP,P,T,T,T,T],
    [T,T,T,T,T,T,DP,P,P,DP,DP,DP,P,P,P,DP,T,T,T,T],
    [T,T,T,T,T,T,P,LP,LP,LP,F,LP,F,LP,LP,P,T,T,T,T],
    [T,T,T,T,T,T,P,LP,LP,F,LP,F,LP,F,LP,P,T,T,T,T],
    [T,T,T,T,T,T,P,LP,LP,LP,F,LP,F,LP,LP,P,T,T,T,T],
    [T,T,T,T,T,T,T,P,LP,LP,LP,LP,LP,LP,P,T,T,T,T,T],
    [T,T,T,T,SH,SH,SH,T,P,P,P,P,P,T,SH,SH,SH,T,T,T],
    [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T]
  ], {
    [T]:"transparent",
    [LG]:"#a7e63f",
    [G]:"#7fbd2f",
    [DG]:"#3f7624",
    [LP]:"#ff9ec7",
    [P]:"#f472b6",
    [DP]:"#c74387",
    [W]:"#ffeaf3",
    [F]:"#6f5f7a",
    [SH]:"#54586a"
  }, 4);
};

export const render = ({output}) => {
  let parsed = {data:{}, offset:0};

  try {
    const stored = localStorage.getItem("weeklyPlannerData");
    if(stored) parsed = JSON.parse(stored);
  } catch(e) {}

  const offset = getOffset(parsed);
  const allData = parsed.data || {};
  const key = weekKey(offset);

  if(!allData[key]) {
    allData[key] = initWeek();
  }

  const data = allData[key];
  data.tasks = data.tasks.map(function(day){
    return day.filter(function(task){
      return task && task.text && task.text.trim() !== "";
    });
  });

  if (!data.habitNames) {
    data.habitNames = ["", "", "", "", "", ""];
    try {
      const sn = localStorage.getItem("weeklyPlannerHabitNames");
      if (sn) data.habitNames = JSON.parse(sn);
    } catch(e) {}
  }

  if (!Array.isArray(data.habitNames)) {
    data.habitNames = [];
  }
  data.habitNames = data.habitNames.concat(["", "", "", "", "", ""]).slice(0, 6);

  if (!Array.isArray(data.habits)) {
    data.habits = [];
  }
  data.habits = data.habits.concat([
    [false,false,false,false,false,false,false],
    [false,false,false,false,false,false,false],
    [false,false,false,false,false,false,false],
    [false,false,false,false,false,false,false],
    [false,false,false,false,false,false,false],
    [false,false,false,false,false,false,false]
  ]).slice(0, 6).map(function(row) {
    if (!Array.isArray(row)) {
      row = [];
    }
    return row.concat([false,false,false,false,false,false,false]).slice(0, 7);
  });

  if (!Array.isArray(data.notes)) {
    data.notes = [];
  }

  data.notes = data.notes.map(function(note) {
    if (typeof note === "string") {
      return { text: note, done: false };
    }
    return {
      text: note && note.text ? String(note.text) : "",
      done: note && note.done ? true : false
    };
  }).filter(function(note) {
    return note.text && note.text.trim() !== "";
  });
  
  saveData(allData, offset);

  let pendingTask = null;
  try {
    const p = localStorage.getItem("pendingTask");
    if (p) pendingTask = JSON.parse(p);
  } catch(e) {}

  let pendingRecategorizeTask = null;
  try {
    const p = localStorage.getItem("pendingRecategorizeTask");
    if (p) pendingRecategorizeTask = JSON.parse(p);
  } catch(e) {}

  function applyCategoryFromModal(targetCat) {
    const s = localStorage.getItem("weeklyPlannerData");
    let cData = s ? JSON.parse(s) : {data:{}, offset:0};
    if (!cData.data[key]) cData.data[key] = initWeek();

    if (pendingRecategorizeTask) {
      const d = pendingRecategorizeTask.dayIndex;
      const t = pendingRecategorizeTask.taskIndex;
      if (cData.data[key].tasks[d] && cData.data[key].tasks[d][t]) {
        cData.data[key].tasks[d][t].cat = targetCat;
      }
      localStorage.removeItem("pendingRecategorizeTask");
    } else if (pendingTask) {
      cData.data[key].tasks[pendingTask.dayIndex].push({
        text: pendingTask.text,
        cat: targetCat,
        done: false
      });
      localStorage.removeItem("pendingTask");
    }

    localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
    window.onkeydown = null;
    if (window.location) window.location.reload();
  }

  if (pendingTask || pendingRecategorizeTask) {
    window.onkeydown = function(e) {
      const stroke = e.key.toLowerCase();
      let targetCat = null;
      
      if (stroke === 'w') targetCat = 't';
      if (stroke === 'a') targetCat = 'a';
      if (stroke === 'c') targetCat = 'c';
      if (stroke === 'l') targetCat = 'l';
      if (stroke === 'm') targetCat = 'ad';
      if (stroke === 'd') targetCat = 'd';

      if (targetCat) {
        applyCategoryFromModal(targetCat);
      } else if (stroke === 'n') {
        applyCategoryFromModal("none");
      } else if (e.key === 'Escape') {
        localStorage.removeItem("pendingTask");
        localStorage.removeItem("pendingRecategorizeTask");
        window.onkeydown = null;
        if (window.location) window.location.reload();
      }
    };
  } else {
    window.onkeydown = null;
  }

  const ws = getWeekStart(offset);
  const we = new Date(ws);
  we.setDate(ws.getDate()+6);

  let total = 0;
  let done = 0;

  data.tasks.forEach(function(day){
    day.forEach(function(t){
      total++;
      if(t.done) done++;
    });
  });

  const pct = total ? Math.round(done/total*100) : 0;

  const navBtn = {
    background:"none",
    border:"1px solid #9090a0",
    color:"#555566",
    cursor:"pointer",
    width:"22px",
    height:"22px",
    borderRadius:"4px",
    fontSize:"18px",
    fontFamily:"'Share Tech Mono',monospace",
    padding:"0",
    lineHeight:"20px"
  };

  // DRAG AND DROP BETWEEN TASKS

  function moveTaskToPosition(sourceDay, sourceIdx, targetDay, targetIdx) {
  const s = localStorage.getItem("weeklyPlannerData");
  if (!s) return;

  let cData = JSON.parse(s);
  if (!cData.data[key]) cData.data[key] = initWeek();

  const sourceList = cData.data[key].tasks[sourceDay];
  const targetList = cData.data[key].tasks[targetDay];

  if (!sourceList || !targetList || !sourceList[sourceIdx]) return;

  const taskToMove = sourceList.splice(sourceIdx, 1)[0];

  let insertAt = targetIdx;

  if (sourceDay === targetDay && sourceIdx < targetIdx) {
    insertAt = targetIdx - 1;
  }

  if (insertAt < 0) insertAt = 0;
  if (insertAt > targetList.length) insertAt = targetList.length;

  targetList.splice(insertAt, 0, taskToMove);

  localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
  if (window.location) window.location.reload();
}

// Changes the displayed week and saves the new week offset
function changeWeek(newOffset) {
  const s = localStorage.getItem("weeklyPlannerData");
  let cData = s ? JSON.parse(s) : { data:{}, offset:0 };

  cData.offset = newOffset;

  localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));

  if(window.location) {
    window.location.reload();
  }
}
  // MASTER CONTEINER STYLES AND POSITIONING

  const styles = {
    outerWrapper: {
      position: "relative",
      marginLeft: "25px", // adjust this value to move the widget horizontally
      marginTop: "10px", // to move the widget vertically
      background:"#E8E3E7",
      borderRadius:"12px",
      fontFamily:"'Share Tech Mono',monospace",
      width:"1120px",
      padding:"8px",
      boxShadow:"0 14px 32px rgba(4,6,14,0.34), 0 2px 0 rgba(255,255,255,0.38) inset, 0 0 0 1px rgba(255,255,255,0.22)"
    },
    
    contentCard: {
      background:"transparent",
      width:"100%",
      boxShadow:"0 0 0 1px rgba(255,255,255,0.08) inset"
    },
    headerBar: {
      background:"transparent",
      padding:"16px 24px 12px",
      borderBottom:"1px solid rgba(85,85,102,0.28)",
      display:"flex",
      justifyContent:"space-between",
      alignItems:"flex-start"
    },
    headerRow: {
      display:"flex",
      alignItems:"center",
      gap:"8px"
    },
    titleBlock: {
      display:"inline-flex",
      flexDirection:"column",
      alignItems:"flex-start"
    },
    titleText: {
      fontFamily:"'Silkscreen', 'Share Tech Mono', monospace",
      fontSize:"30px",
      fontWeight:400,
      color:"#1a1a2e",
      letterSpacing:"1.5px",
      textTransform:"uppercase",
      WebkitFontSmoothing:"none",
      MozOsxFontSmoothing:"grayscale",
      textRendering:"pixelated",
      background:"#E8E3E7",
      padding:"4px 8px",
      borderRadius:"6px"
    },
    subtitleText: {
      display:"flex",
      alignItems:"center",
      justifyContent:"space-between",
      gap:"0",
      fontFamily:"'Silkscreen', 'Share Tech Mono', monospace",
      fontSize:"12px",
      fontWeight:400,
      color:"#555566",
      marginTop:"4px",
      marginLeft:"8px",
      width:"calc(100% - 16px)",
      letterSpacing:"3px",
      WebkitFontSmoothing:"none",
      MozOsxFontSmoothing:"grayscale",
      textRendering:"pixelated",
      textAlign:"left"
    },
    subtitleDot: {
      width:"2px",
      height:"2px",
      background:"#555566",
      display:"inline-block",
      flexShrink:0
    },
    legendBar: {
      background:"transparent",
      padding:"10px 24px",
      display:"flex",
      gap:"28px"
    },
    legendItem: {
      display:"flex",
      alignItems:"center",
      gap:"8px",
      fontFamily:"'PixelOperatorMono', 'Share Tech Mono', monospace",
      fontSize:"12px",
      color:"#1a1a2e",
      letterSpacing:"1px"
    },
    legendBullet: {
      width:"12px",
      height:"12px",
      borderRadius:"3px",
      display:"inline-block",
      border:"1px solid transparent"
    },
    boardFrame: {
      background:"#13131f",
      backgroundImage:"radial-gradient(circle at top left, #E8E3E7 0 8px, transparent 8px), radial-gradient(circle at top right, #E8E3E7 0 8px, transparent 8px)",
      filter:"none"
    },
    darkBody: {
      background:"#1D2338",
      borderRadius:"0 0 8px 8px",
      paddingBottom:"18px",
      overflow:"hidden"
    },
// WEEKLY GRID
    weeklyGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  background: "#2D344E",
  border: "0.25px solid rgba(255,255,255,0.18)",
  borderRadius: "12px",
  overflow: "hidden"
},
    
    dayHeader: {
      background:"#1F2537",
      padding:"10px 8px 8px",
      textAlign:"center",
      borderBottom:"0.25px solid rgba(255,255,255,0.18)"
    },

    taskList: {
      display:"block",
      padding:"8px 6px",
      minHeight:"340px"
    },
    notesGrid: {
      display:"grid",
      gridTemplateColumns:"1fr 1fr 1fr",
      gap:"14px",
      marginTop:"16px"
    },
    cardPanel: {
      padding:"14px 18px 18px",
      background:"transparent",
      border:"0.25px solid rgba(255,255,255,0.18)",
      borderRadius:"12px",
      boxShadow:"0 1px 0 rgba(255,255,255,0.08) inset"
    },
    progressCard: {
      padding:"14px 18px 18px",
      background:"transparent",
      border:"0.25px solid rgba(255,255,255,0.18)",
      borderRadius:"12px",
      boxShadow:"0 1px 0 rgba(255,255,255,0.08) inset",
      display:"flex",
      justifyContent:"space-between",
      alignItems:"flex-start"
    },
    footer: {
      marginTop:"16px",
      background:"transparent",
      padding:"10px 24px",
      display:"flex",
      justifyContent: "center",
      alignItems:"center"
    }
  };

  return (
    <div style={styles.outerWrapper}>
      {pendingTask && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(19, 19, 31, 0.88)",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          padding: "40px"
        }}>
          <div style={{
            background: "#E8E3E7",
            padding: "24px",
            borderRadius: "12px",
            width: "420px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            textAlign: "center"
          }}>
            <div style={{
              fontFamily: "'Silkscreen', monospace",
              fontSize: "14px",
              color: "#13131f",
              marginBottom: "14px",
              letterSpacing: "1px"
            }}>
              SELECT CATEGORY BY KEY
            </div>
            
            <div style={{
              background: "#13131f",
              color: "#E8E3E7",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "'IBM Plex Mono', monospace",
              marginBottom: "20px",
              textAlign: "left",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}>
              "{pendingTask.text}"
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "18px"
            }}>
              {CAT_KEYS.map(function(k) {
                return (
                  <button
                    key={k}
                    onClick={function() {
                      const s = localStorage.getItem("weeklyPlannerData");
                      let cData = s ? JSON.parse(s) : {data:{}, offset:0};
                      if (!cData.data[key]) cData.data[key] = initWeek();
                      cData.data[key].tasks[pendingTask.dayIndex].push({
                        text: pendingTask.text,
                        cat: k,
                        done: false
                      });
                      localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
                      localStorage.removeItem("pendingTask");
                      window.onkeydown = null;
                      if (window.location) window.location.reload();
                    }}
                    style={{
                      background: CAT_COLORS[k],
                      border: "1px solid " + CAT_BORDER_COLORS[k],
                      color: "#13131f",
                      padding: "10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "bold",
                      fontFamily: "'Share Tech Mono', monospace",
                      textAlign: "center"
                    }}
                  >
                    {KEY_HINTS[k]}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={function() {
                  const s = localStorage.getItem("weeklyPlannerData");
                  let cData = s ? JSON.parse(s) : {data:{}, offset:0};
                  if (!cData.data[key]) cData.data[key] = initWeek();
                  cData.data[key].tasks[pendingTask.dayIndex].push({
                    text: pendingTask.text,
                    cat: "none",
                    done: false
                  });
                  localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
                  localStorage.removeItem("pendingTask");
                  window.onkeydown = null;
                  if (window.location) window.location.reload();
                }}
                style={{
                  flex: 1,
                  background: "#8892a4",
                  border: "none",
                  color: "#13131f",
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  fontFamily: "'Share Tech Mono', monospace"
                }}
              >
                NO CATEGORY [N]
              </button>
              
              <button
                onClick={function() {
                  localStorage.removeItem("pendingTask");
                  window.onkeydown = null;
                  if (window.location) window.location.reload();
                }}
                style={{
                  flex: 1,
                  background: "#ef4444",
                  border: "none",
                  color: "#ffffff",
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  fontFamily: "'Share Tech Mono', monospace"
                }}
              >
                CANCEL [Esc]
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingRecategorizeTask && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(19, 19, 31, 0.88)",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          padding: "40px"
        }}>
          <div style={{
            background: "#E8E3E7",
            padding: "24px",
            borderRadius: "12px",
            width: "420px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            textAlign: "center"
          }}>
            <div style={{
              fontFamily: "'Silkscreen', monospace",
              fontSize: "14px",
              color: "#13131f",
              marginBottom: "14px",
              letterSpacing: "1px"
            }}>
              RECATEGORIZE TASK
            </div>
            
            <div style={{
              background: "#13131f",
              color: "#E8E3E7",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontFamily: "'IBM Plex Mono', monospace",
              marginBottom: "20px",
              textAlign: "left",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}>
              "{pendingRecategorizeTask.text}"
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "18px"
            }}>
              {CAT_KEYS.map(function(k) {
                return (
                  <button
                    key={k}
                    onClick={function() {
                      applyCategoryFromModal(k);
                    }}
                    style={{
                      background: CAT_COLORS[k],
                      border: "1px solid " + CAT_BORDER_COLORS[k],
                      color: "#13131f",
                      padding: "10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "bold",
                      fontFamily: "'Share Tech Mono', monospace",
                      textAlign: "center"
                    }}
                  >
                    {KEY_HINTS[k]}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={function() {
                  applyCategoryFromModal("none");
                }}
                style={{
                  flex: 1,
                  background: "#8892a4",
                  border: "none",
                  color: "#13131f",
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  fontFamily: "'Share Tech Mono', monospace"
                }}
              >
                NO CATEGORY [N]
              </button>
              
              <button
                onClick={function() {
                  localStorage.removeItem("pendingRecategorizeTask");
                  window.onkeydown = null;
                  if (window.location) window.location.reload();
                }}
                style={{
                  flex: 1,
                  background: "#ef4444",
                  border: "none",
                  color: "#ffffff",
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "bold",
                  fontFamily: "'Share Tech Mono', monospace"
                }}
              >
                CANCEL [Esc]
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.contentCard}>
      <div style={styles.headerBar}>
        <div style={styles.titleBlock}>
          <div style={styles.headerRow}>
            <div style={styles.titleText}>
              WEEKLY PLANNER
            </div>
            <PixelHeart/>
          </div>

          <div style={styles.subtitleText}>
            <span>+ FOCUS</span>
            <span style={styles.subtitleDot}/>
            <span>ORGANIZE</span>
            <span style={styles.subtitleDot}/>
            <span>BALANCE +</span>
          </div>
        </div>

        <div style={{textAlign:"right"}}>
          <div style={{
            fontSize:"14px",
            color:"#f472b6",
            letterSpacing:"1px"
          }}>
            {fmtDate(ws)} - {fmtDate(we)} {we.getFullYear()}
          </div>

          <div style={{
            display:"flex",
            alignItems:"center",
            gap:"8px",
            marginTop:"6px",
            justifyContent:"flex-end"
          }}>
            <button style={navBtn}
              onClick={function(){
                changeWeek(offset-1);
              }}> 
              &#8249;
            </button>

            <span style={{
              fontSize:"12px",
              color:"#555566",
              letterSpacing:"1px"
            }}>
              WEEK {isoWeek(ws)}
            </span>

            <button style={navBtn} onClick={function(){ changeWeek(offset+1); if(window.location) window.location.reload(); }}>
              &#8250;
            </button>
          </div>
        </div>
      </div>

      <div style={styles.legendBar}>
        {CAT_KEYS.map(function(k){
          return (
            <div key={k} style={styles.legendItem}>
              <span style={{
                ...styles.legendBullet,
                background:CAT_COLORS[k],
                borderColor:CAT_BORDER_COLORS[k]
              }}/>
              {CAT_NAMES[k]}
            </div>
          );
        })}
      </div>

      <div style={styles.darkBody}>
      <div style={styles.boardFrame}>
        <div style={styles.weeklyGrid}>
          {DAYS_WEEK.map(function(day, di){
            const date = new Date(ws);
            date.setDate(ws.getDate()+di);

            return (
              <div key={di} style={{
                minWidth:"0",
                borderRight: di < 6 ? "0.25px solid rgba(255,255,255,0.18)" : "none"
                }}>
                <div style={styles.dayHeader}>
                  <div style={{
                    fontFamily:"'Silkscreen', 'Share Tech Mono', monospace",
                    fontSize:"18px",
                    letterSpacing:"0px",
                    fontWeight:"normal",
                    color:"#F4A7D0"
                  }}>
                    {day}
                  </div>

                  <div style={{
                    fontFamily:"'Share Tech Mono', monospace",
                    fontSize:"16px",
                    fontWeight:"bold",
                    marginTop:"2px",
                    color:"#F4A7D0"
                  }}>
                    {date.getDate()}
                  </div>
                </div>

                <div 
                  style={styles.taskList}
                  onDragOver={function(e) {
                    e.preventDefault();
                  }}
                  onDrop={function(e) {
                  e.preventDefault();

                  try {
                  const dragDataRaw = e.dataTransfer.getData("application/json");
               if (!dragDataRaw) return;

    const { sourceDay, sourceIdx } = JSON.parse(dragDataRaw);

    moveTaskToPosition(
      sourceDay,
      sourceIdx,
      di,
      data.tasks[di].length
    );
  } catch(err) {}
}}
                >
                  {data.tasks[di].map(function(task, ti){
                    if(!task || !task.text) return null;
                    
                    const hasCat = task.cat && CAT_COLORS[task.cat];
                    const bgStyle = hasCat ? CAT_COLORS[task.cat] : "transparent";
                    
                    let textCol = "#E8E3E7";
                    if (task.done) {
                      textCol = "#66636C";
                    } else if (hasCat) {
                      textCol = "#13131f"; 
                    }

                    const containerId = "task-container-" + di + "-" + ti;

                    return (
                      <div 
                        key={ti} 
                        id={containerId}
                        className="task-container" 
                        style={{ marginBottom: "6px", cursor: "grab" }}
                        draggable={true}
                        onDragOver={function(e) {
                        e.preventDefault();
                        }}
                        onDrop={function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                        const dragDataRaw = e.dataTransfer.getData("application/json");
                        if (!dragDataRaw) return;

                        const { sourceDay, sourceIdx } = JSON.parse(dragDataRaw);

                        moveTaskToPosition(sourceDay, sourceIdx, di, ti);
                        } catch(err) {}
                        }}
                        onDragStart={function(e) {
                        e.dataTransfer.setData("application/json", JSON.stringify({ sourceDay: di, sourceIdx: ti }));
                        }}
                        onContextMenu={function(e) {
                        e.preventDefault();
                        localStorage.setItem("pendingRecategorizeTask", JSON.stringify({
                        dayIndex: di,
                        taskIndex: ti,
                        text: task.text
                          }));
                          if (window.location) window.location.reload();
                        }}
                      >
                        <div 
                          style={{
                            display:"flex",
                            justify:"space-between",
                            alignItems:"flex-start",
                            padding: hasCat ? "4px 8px" : "4px 2px",
                            fontFamily:"'IBM Plex Mono', monospace",
                            fontSize:"11px",
                            lineHeight:"1.4",
                            backgroundColor: bgStyle,
                            borderRadius: hasCat ? "4px" : "0px",
                            color: textCol,
                            border: "none"
                          }}
                        >
                          <span 
                            style={{
                              marginRight: "6px",
                              cursor: "pointer",
                              userSelect: "none",
                              color: textCol,
                              fontWeight: hasCat ? "500" : "normal",
                              whiteSpace: "nowrap"
                            }}
                            onClick={function(e) {
                              const s = localStorage.getItem("weeklyPlannerData");
                              if(!s) return;
                              let cData = JSON.parse(s);
                              if(cData.data[key] && cData.data[key].tasks[di][ti]) {
                                cData.data[key].tasks[di][ti].done = !cData.data[key].tasks[di][ti].done;
                                localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
                                if(window.location) window.location.reload();
                              }
                            }}
                          >
                            {task.done ? "[x]" : "[ ]"}
                          </span>

                          <span
                            contentEditable
                            suppressContentEditableWarning
                            style={{
                              background: "transparent",
                              border: "none",
                              color: textCol,
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: "11px",
                              flex: "1",
                              minWidth: "0",
                              outline: "none",
                              padding: "0",
                              textDecoration: task.done ? "line-through" : "none",
                              fontWeight: hasCat ? "500" : "normal",
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap"
                            }}
                            onMouseDown={function(e) {
                              // Desativa temporariamente o drag do elemento pai para permitir o foco de edição
                              const p = document.getElementById(containerId);
                              if(p) p.setAttribute("draggable", "false");
                            }}
                            onDoubleClick={function(e) {
                              e.target.focus();
                            }}
                            onBlur={function(e) {
                              // Devolve a permissão de arrasto após terminar a edição
                              const p = document.getElementById(containerId);
                              if(p) p.setAttribute("draggable", "true");

                              const val = e.target.innerText.trim();
                              const s = localStorage.getItem("weeklyPlannerData");
                              if(!s) return;
                              let cData = JSON.parse(s);
                              if(cData.data[key] && cData.data[key].tasks[di]) {
                                if (val === "") {
                                  cData.data[key].tasks[di].splice(ti, 1);
                                } else {
                                  cData.data[key].tasks[di][ti].text = val;
                                }
                                localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
                                if(window.location) window.location.reload();
                              }
                            }}
                            onKeyDown={function(e) {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.target.blur();
                              }
                            }}
                          >
                            {task.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <input
                    type="text"
                    placeholder="+ new task"
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px dashed #444b5c",
                      color: "#8892a4",
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "12px",
                      width: "100%",
                      padding: "4px 2px",
                      outline: "none",
                      marginTop: "12px"
                    }}
                    onKeyDown={function(e) {
                      if (e.key === 'Enter' && e.target.value.trim() !== "") {
                        const val = e.target.value.trim();
                        localStorage.setItem("pendingTask", JSON.stringify({ text: val, dayIndex: di }));
                        e.target.value = "";
                        if (window.location) window.location.reload();
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.notesGrid}>
        <div style={styles.cardPanel}>
          <div style={{
            display:"flex",
            alignItems:"center",
            gap:"6px",
            fontFamily:"'Silkscreen', 'Share Tech Mono', monospace",
	    fontSize:"18px",
  	    letterSpacing:"0px",
 	    color:"#F4A7D0",
            marginBottom:"10px"
          }}>
            <span style={{fontSize:"14px"}}>≡</span> NOTES
          </div>

          {data.notes.map(function(note, ni){
            if (typeof note === "string") {
              note = { text: note, done: false };
            }

            const noteTextColor = note.done ? "#66636C" : "#E8E3E7";

            return (
              <div key={ni} style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "6px",
                paddingLeft: "2px"
              }}>
                <span
                  onClick={function() {
                    const s = localStorage.getItem("weeklyPlannerData");
                    if(!s) return;
                    let cData = JSON.parse(s);
                    if(!cData.data[key]) cData.data[key] = initWeek();
                    if(!Array.isArray(cData.data[key].notes)) cData.data[key].notes = [];

                    if (typeof cData.data[key].notes[ni] === "string") {
                      cData.data[key].notes[ni] = {
                        text: cData.data[key].notes[ni],
                        done: false
                      };
                    }

                    cData.data[key].notes[ni].done = !cData.data[key].notes[ni].done;
                    localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
                    if(window.location) window.location.reload();
                  }}
                  style={{
                    color: noteTextColor,
                    marginRight: "6px",
                    fontSize: "11px",
                    cursor: "pointer",
                    userSelect: "none",
                    fontFamily: "'IBM Plex Mono', monospace",
                    whiteSpace: "nowrap"
                  }}
                >
                  {note.done ? "[x]" : "[ ]"}
                </span>

                <input
                  type="text"
                  defaultValue={note.text}
                  placeholder="Write note..."
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px dashed transparent",
                    color: noteTextColor,
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "11px",
                    flex: "1",
                    minWidth: "0",
                    outline: "none",
                    padding: "2px 0",
                    textDecoration: note.done ? "line-through" : "none"
                  }}
                  onFocus={function(e) { e.target.style.borderBottom = "1px dashed #444b5c"; }}
                  onBlur={function(e) {
                    e.target.style.borderBottom = "1px dashed transparent";
                    const val = e.target.value.trim();
                    const s = localStorage.getItem("weeklyPlannerData");
                    if(!s) return;
                    let cData = JSON.parse(s);
                    if(!cData.data[key]) cData.data[key] = initWeek();
                    if(!Array.isArray(cData.data[key].notes)) cData.data[key].notes = [];

                    if (typeof cData.data[key].notes[ni] === "string") {
                      cData.data[key].notes[ni] = {
                        text: cData.data[key].notes[ni],
                        done: false
                      };
                    }

                    if (val === "") {
                      cData.data[key].notes.splice(ni, 1);
                    } else {
                      cData.data[key].notes[ni] = {
                        text: val,
                        done: cData.data[key].notes[ni] && cData.data[key].notes[ni].done ? true : false
                      };
                    }

                    localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
                    if(window.location) window.location.reload();
                  }}
                  onKeyDown={function(e) {
                    if (e.key === 'Enter') {
                      e.target.blur();
                    }
                  }}
                />
                <button
                  onClick={function() {
                    const s = localStorage.getItem("weeklyPlannerData");
                    if(!s) return;
                    let cData = JSON.parse(s);
                    if(!cData.data[key]) cData.data[key] = initWeek();
                    if(!Array.isArray(cData.data[key].notes)) cData.data[key].notes = [];
                    cData.data[key].notes.splice(ni, 1);
                    localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
                    if(window.location) window.location.reload();
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#8892a4",
                    cursor: "pointer",
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "12px",
                    padding: "0 0 0 6px",
                    lineHeight: "1"
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}

          <input
            type="text"
            placeholder="+ new note"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: "1px dashed #444b5c",
              color: "#8892a4",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "12px",
              width: "100%",
              padding: "4px 2px",
              outline: "none",
              marginTop: "12px"
            }}
            onKeyDown={function(e) {
              if (e.key === 'Enter' && e.target.value.trim() !== "") {
                const val = e.target.value.trim();
                const s = localStorage.getItem("weeklyPlannerData");
                let cData = s ? JSON.parse(s) : {data:{}, offset:0};
                if(!cData.data[key]) cData.data[key] = initWeek();
                if(!Array.isArray(cData.data[key].notes)) cData.data[key].notes = [];
                cData.data[key].notes.push({ text: val, done: false });
                localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
                e.target.value = "";
                if(window.location) window.location.reload();
              }
            }}
          />

          <div style={{
            marginTop:"12px",
            display:"flex",
            justifyContent:"flex-end"
          }}>
            <PixelHeartSmall/>
          </div>
        </div>

        <div style={styles.cardPanel}>
          <div style={{
            display:"flex",
            alignItems:"center",
            gap:"6px",
            fontFamily:"'Silkscreen', 'Share Tech Mono', monospace",
	    fontSize:"18px",
  	    letterSpacing:"0px",
 	    color:"#F4A7D0",
            marginBottom:"8px"
          }}>
            <span style={{fontSize:"14px"}}>⊞</span> HABITS TRACKER
          </div>

          <div style={{
            display:"flex",
            justifyContent:"flex-end",
            marginBottom:"6px",
            paddingRight:"0px"
          }}>
            <div style={{
              display:"flex",
              gap:"4px"
            }}>
              {DAYS_WEEK.map(function(d){
                return (
                  <span key={d} style={{
                    width:"11px",
                    textAlign:"center",
                    fontSize:"10px",
                    color:"#E8E3E7",
                    display:"inline-block"
                  }}>
                    {d[0]}
                  </span>
                );
              })}
            </div>
          </div>

          {data.habitNames.map(function(hName, hi){
            const hColor = HABIT_COLORS[hi] || "#2dd4bf";
            return (
              <div key={hi} style={{
                display:"flex",
                alignItems:"center",
                justifyContent:"space-between",
                marginBottom:"8px"
              }}>
                <input
                  type="text"
                  defaultValue={hName}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px dashed transparent",
                    color: "#E8E3E7",
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "11px",
                    flex: "1",
                    minWidth: "0",
                    marginRight: "10px",
                    outline: "none",
                    padding: "2px 0"
                  }}
                  onFocus={function(e) { e.target.style.borderBottom = "1px dashed #444b5c"; }}
                  onBlur={function(e) {
                    e.target.style.borderBottom = "1px dashed transparent";
                    const val = e.target.value.trim() || data.habitNames[hi];
                    const s = localStorage.getItem("weeklyPlannerData");
                    if(!s) return;
                    let cData = JSON.parse(s);
                    if(!cData.data[key].habitNames) {
                      cData.data[key].habitNames = ["", "", "", "", "", ""];
                    }
                    cData.data[key].habitNames[hi] = val;
                    localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));
                    if(window.location) window.location.reload();
                  }}
                  onKeyDown={function(e) {
                    if (e.key === 'Enter') {
                      e.target.blur();
                    }
                  }}
                />

                <span style={{
                  display:"flex",
                  gap:"4px"
                }}>
                  {data.habits[hi].map(function(active,d){
                    return (
                      <span
                        key={d}
                        // Click inverts the habit status for the day and updates localStorage
                        onClick={function(e){
                          const s = localStorage.getItem("weeklyPlannerData");
                          let cData = s ? JSON.parse(s) : {data:{}, offset:offset};

                          if(!cData.data[key]) {
                          cData.data[key] = initWeek();
                          }

                          if(!Array.isArray(cData.data[key].habits)) {
                          cData.data[key].habits = initWeek().habits;
                          }

                          if(!Array.isArray(cData.data[key].habits[hi])) {
                          cData.data[key].habits[hi] = [false,false,false,false,false,false,false];
                          }

                          const nextStatus = !cData.data[key].habits[hi][d];
                          cData.data[key].habits[hi][d] = nextStatus;

                          localStorage.setItem("weeklyPlannerData", JSON.stringify(cData));

                          e.currentTarget.style.background = nextStatus ? hColor : "transparent";
                          e.currentTarget.style.borderColor = nextStatus ? hColor : "#E8E3E7";
                        }}

                        style={{
                          width:"11px",
                          height:"11px",
                          borderRadius:"50%",
                          cursor:"pointer",
                          display:"inline-block",
                          background:active ? hColor : "transparent",
		// small ball color and border based on habit status
                          border:"1px solid " + (active ? hColor : "#E8E3E7")
                        }}
                      />
                    );
                  })}
                </span>
              </div>
            );
          })}
        </div>

        <div style={styles.progressCard}>
          <div style={{flex:1}}>
            <div style={{
              display:"flex",
              alignItems:"center",
              gap:"6px",
              fontFamily:"'Silkscreen', 'Share Tech Mono', monospace",
	      fontSize:"18px",
  	      letterSpacing:"0px",
 	      color:"#F4A7D0",
              marginBottom:"8px"
            }}>
              <span style={{fontSize:"14px"}}>▲</span> WEEK PROGRESS
            </div>


           <div style={{
              fontFamily:"'PixelOperatorMono', 'Share Tech Mono', monospace",

  fontSize:"32px",
  fontWeight:"bold",
  color:"#F4A7D0",
  marginBottom:"6px"
}}>
  {pct}%
</div>

            <div style={{
              background:"#2a2a45",
              borderRadius:"4px",
              height:"8px",
              marginBottom:"6px",
              overflow:"hidden"
            }}>
              <div style={{
                height:"100%",
                background:"#F4A7D0",
                borderRadius:"4px",
                width:pct+"%"
              }}/>
            </div>

            <div style={{
              fontSize:"11px",
              color:"#E8E3E7"
            }}>
              {done} / {total} tasks completed
            </div>
          </div>

          <div style={{
            marginLeft:"16px",
            marginTop:"0px"
          }}>
            <PixelPlant/>
          </div>
        </div>
      </div>
      </div>

      <div style={styles.footer}>
        <span style={{
          fontSize:"14px",
          color:"#555566",
          letterSpacing:"1px"
        }}>
          "Small progress is still progress."
        </span>
      </div>
    </div>
  </div>
  );
};