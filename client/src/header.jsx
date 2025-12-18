import box from './assets/Text-Box.png';


export function Header() {
    return (
        <header>

            <form action ="" className = "search-form">
                <input type="text" placeholder="Search..." className="search-box"/>
                <button type ="submit" className="search-button">GO</button>
            </form>
        </header>
    );
}