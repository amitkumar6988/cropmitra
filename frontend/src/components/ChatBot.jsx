import { useState, useRef, useEffect } from "react";
import { axiosInstance } from "../libs/axios";

export default function ChatBot() {

const [message,setMessage] = useState("");
const [messages,setMessages] = useState([]);
const [open,setOpen] = useState(false);
const [loading,setLoading] = useState(false);

const chatRef = useRef(null);

useEffect(()=>{
  if(chatRef.current){
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }
},[messages]);

const sendMessage = async () => {

if(!message.trim()) return;

const userMessage = {type:"user",text:message};

setMessages(prev => [...prev,userMessage]);
setMessage("");
setLoading(true);

try{

const res = await axiosInstance.post("/chat",{message});

setMessages(prev => [
...prev,
{type:"bot",text:res.data.reply}
]);

}catch(err){
console.log(err);
}

setLoading(false);

};

return(

<div style={{zIndex:9999}}>

{/* Floating Button */}

<div
onClick={()=>setOpen(!open)}
style={{
position:"fixed",
bottom:"25px",
right:"25px",
width:"60px",
height:"60px",
borderRadius:"50%",
background:"#2e7d32",
color:"white",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"26px",
cursor:"pointer",
boxShadow:"0 6px 20px rgba(0,0,0,0.25)",
zIndex:9999
}}
>
💬
</div>


{/* Chat Window */}

{open && (

<div style={{
position:"fixed",
bottom:"100px",
right:"25px",
width:"320px",
height:"420px",
background:"white",
borderRadius:"14px",
boxShadow:"0 10px 30px rgba(0,0,0,0.25)",
display:"flex",
flexDirection:"column",
overflow:"hidden",
zIndex:9999
}}>


{/* Header */}

<div style={{
background:"#2e7d32",
color:"white",
padding:"12px",
fontWeight:"600",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}>

<span>CropMitra Assistant 🌱</span>

<span
style={{cursor:"pointer"}}
onClick={()=>setOpen(false)}
>
✖
</span>

</div>


{/* Messages */}

<div
ref={chatRef}
style={{
flex:1,
padding:"10px",
overflowY:"auto",
background:"#f5f5f5"
}}
>

{messages.map((m,i)=>(

<div
key={i}
style={{
display:"flex",
justifyContent:m.type==="user"?"flex-end":"flex-start",
marginBottom:"8px"
}}
>

<div style={{
maxWidth:"70%",
padding:"8px 12px",
borderRadius:"12px",
background:m.type==="user"?"#2e7d32":"white",
color:m.type==="user"?"white":"black",
boxShadow:"0 2px 6px rgba(0,0,0,0.1)"
}}>

{m.text}

</div>

</div>

))}

{loading && (
<div style={{
fontSize:"12px",
color:"gray",
marginTop:"5px"
}}>
Bot typing...
</div>
)}

</div>


{/* Input */}

<div style={{
display:"flex",
padding:"10px",
borderTop:"1px solid #eee"
}}>

<input
value={message}
onChange={(e)=>setMessage(e.target.value)}
onKeyDown={(e)=> e.key==="Enter" && sendMessage()}
placeholder="Ask something..."
style={{
flex:1,
padding:"8px",
borderRadius:"8px",
border:"1px solid #ddd",
outline:"none"
}}
/>

<button
onClick={sendMessage}
style={{
marginLeft:"8px",
background:"#2e7d32",
color:"white",
border:"none",
borderRadius:"8px",
padding:"8px 14px",
cursor:"pointer"
}}
>
Send
</button>

</div>

</div>

)}

</div>

);
}