import Link from 'next/link'

export default function Navbar() {
    return(
        <>
        <div className="navbg">
            <ul style={{ display: "flex", justifyContent: "space-between", padding: 0 }}>
                <li style={{ marginRight: '10px' }}>
                    <Link href="/"><h1 className="navbar">Chat</h1></Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                    <Link href="/calendar"><h1 className="navbar">Calendar</h1></Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                    <Link href="https://github.com/genfuture/depaulai"><h1 className="navbar">Github</h1></Link>
                </li>
                <li style={{marginLeft:'auto' }}>  
                    <img src="/depaulai.png" alt="Depaulai Logo" width="170" height="170" />
                </li>
            </ul>
        </div></>
    );
}