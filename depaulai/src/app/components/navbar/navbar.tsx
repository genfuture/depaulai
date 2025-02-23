import Link from 'next/link'

export default function Navbar() {
    return(
        <div className="navbg">
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex' }}>
                <li style={{ marginRight: '10px' }}>
                    <Link href="/"><h1 className="navbar">Chat</h1></Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                    <Link href="/calendar"><h1 className="navbar">Calendar</h1></Link>
                </li>
            </ul>
        </div>
    );
}