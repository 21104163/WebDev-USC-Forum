function submitPost(event) {
    event.preventDefault();
    const username = "Manana"//sessionStorage.getItem('userID');
    //sample code to get form data

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    console.log('Post submitted:', { username, title, content });

    // Here you would typically send the post data to the server
    document.getElementById('postForm').reset();
}
export function PostCreate() {


    return (
    <div className="card post">
        <h2>Create Post</h2>
        <form action ="" className = "post-form" id="postForm">
            <label for="title">Title:</label>
            <input type ="text" placeholder="Post Title" id="title" maxLength={100}/>
            <label for="content">Content:</label>
            <textarea placeholder="What's on your mind?" id ="content" rows ={4} maxLength={256}/>
            <button type="submit" onClick={submitPost}>Post</button>
        </form>
    </div>
    );
}