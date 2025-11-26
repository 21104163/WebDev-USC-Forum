import box from './assets/Text-Box.png';


export function Header() {
    return (
        <header>
            
            <div className="container">
            <img src={box} alt="Text Box" className="header-logo" />
               &nbsp; USC Forum &nbsp;
            <form action ="" className = "search-form">
                <input type="text" placeholder="Search..." className="search-box"/>
                <button type ="submit" className="search-button">GO</button>
            </form>
            </div>
        </header>
    );
}