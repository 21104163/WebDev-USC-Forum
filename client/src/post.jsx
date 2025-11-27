
export function PostCreate() {
    return (
    <div className="iPost">
        <h2>Create a Post</h2>
        <form action ="" className = "post-form" id="postForm">
            <label for="title">Title:</label>
            <input type ="text" placeholder="Post Title" id="title"/>
            <label for="content">Content:</label>
            <input type ="text" placeholder="What's on your mind?" id ="content"/>
            <button type="submit">Post</button>
        </form>
    </div>
    );
}