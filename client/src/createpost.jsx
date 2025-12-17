
export function PostCreate() {


    return (
    <div className="card post">
        <h2>Create a Post</h2>
        <form action ="" className = "post-form" id="postForm">
            <label for="title">Title:</label>
            <input type ="text" placeholder="Post Title" id="title" maxLength={100}/>
            <label for="content">Content:</label>
            <textarea placeholder="What's on your mind?" id ="content" rows ={4} maxLength={256}/>
            <button type="submit" >Post</button>
        </form>
    </div>
    );
}