import { firebaseConfig } from "./firebase-config.js";
let cloudStatus = "☁ Firebase 尚未設定";
function showStatus() { const el = document.getElementById("cloudBadge"); if (el) el.textContent = cloudStatus; }
window.aiRepublicCloudIndicator = showStatus;
showStatus();
if (firebaseConfig?.apiKey && firebaseConfig?.projectId && firebaseConfig?.appId) {
  const SDK = "https://www.gstatic.com/firebasejs/12.18.0/";
  try {
    const [{initializeApp}, {getAuth,onAuthStateChanged,signInAnonymously}, {getFirestore,doc,collection,setDoc,onSnapshot,serverTimestamp}] = await Promise.all([
      import(SDK+"firebase-app.js"),import(SDK+"firebase-auth.js"),import(SDK+"firebase-firestore.js")
    ]);
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app), db = getFirestore(app);
    let uid = null, pending = null, debounceId = 0, saving = false;
    const queue = (state) => { pending = JSON.parse(JSON.stringify(state)); clearTimeout(debounceId); debounceId = setTimeout(flush, 650); };
    window.aiRepublicCloudSave = queue;
    async function flush() {
      if(!uid || !pending || saving) return;
      const snapshot = pending; pending = null; saving = true;
      try {
        await setDoc(doc(db,"teams",uid),{name:String(snapshot.group||"未命名小隊").slice(0,40),updatedAt:serverTimestamp()},{merge:true});
        for (const [taskId,a] of Object.entries(snapshot.answers||{})) {
          if(!/^(?:[1-5]-[1-6]|FINAL)$/.test(taskId) || !a || !String(a.answer||"").trim()) continue;
          if(a.status === "done") continue;
          await setDoc(doc(db,"teams",uid,"submissions",taskId),{
            answer:String(a.answer||"").slice(0,3000),
            selection:String(a.selection||"").slice(0,50),
            timerSeconds:Number.isFinite(a.timerSeconds)?a.timerSeconds:null,
            status:"submitted",updatedAt:serverTimestamp()
          },{merge:true});
        }
        cloudStatus = "☁ 雲端已同步"; showStatus();
      } catch(error) {cloudStatus="⚠ 雲端寫入失敗（已保存本機）";showStatus();console.warn("Firestore sync",error.code||error.message);}
      finally {saving=false;if(pending)debounceId=setTimeout(flush,650);}
    }
    onAuthStateChanged(auth, async (user) => {
      try {
        if(!user) {cloudStatus="☁ 正在匿名登入";showStatus();await signInAnonymously(auth);return;}
        if(!user.isAnonymous){cloudStatus="⚠ 學生端請使用匿名帳號";showStatus();return;}
        uid=user.uid;cloudStatus="☁ 正在同步";showStatus();
        const saved=JSON.parse(localStorage.getItem("ai-republic-preview-v1")||"{}");queue(saved);
        onSnapshot(collection(db,"teams",uid,"submissions"),(snap)=>{
          try{
            const local=JSON.parse(localStorage.getItem("ai-republic-preview-v1")||"{}");
            local.answers=local.answers||{};let changed=false;
            for(const item of snap.docs){
              const a=local.answers[item.id];if(!a)continue;
              const status=item.data().status==="approved"?"done":item.data().status==="returned"?"retry":null;
              if(status&&a.status!==status){a.status=status;changed=true;}
            }
            if(changed)localStorage.setItem("ai-republic-preview-v1",JSON.stringify(local));
          }catch(e){console.warn(e);}
        });
      }catch(error){cloudStatus="⚠ Firebase 登入失敗";showStatus();console.warn(error);}
    });
  }catch(error){cloudStatus="⚠ Firebase 初始化失敗";showStatus();console.warn(error);}
}
