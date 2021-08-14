var userDetails = {};
var comments = [];
var counter = 0;

const inputComment = document.getElementById("myInput");

const commentList = document.getElementById("commentList");

window.onload = () => {
  fetch("https://randomuser.me/api/")
    .then((res) => res.json())
    .then((res) => {
      userDetails = res.results[0];
    });
};

const commentCard = (obj) => `
    <div data-parentId="${obj.parentCommentId}" id="${obj.commentId}">
    ${obj.commentText}
        <a href="#">Likes</a><span style="color: red"> ${
          obj.Likes === 0 ? "" : obj.Likes
        }</span>
        <a href="#">Reply</a><span style="color: red"> ${
          obj.childComments.length === 0 ? "" : obj.childComments.length
        }</span>
        <a href="#"> Delete </a>
    </div>
    `;

const increaseLike = (allComments, newCommentLikeId) => {
  for (let i of allComments) {
    if (i.commentId === newCommentLikeId) {
      i.Likes += 1;
    } else if (i.childComments.length > 0) {
        increaseLike(i.childComments, newCommentLikeId);
    }
  }
};

const deleteComment = (allComments, newCommentId) => {
  for (let i in allComments) {
    if (allComments[i].commentId === newCommentId) {
      allComments.splice(i, 1);
    } else if (allComments[i].childComments.length > 0) {
      deleteComment(allComments[i].childComments, newCommentId);
    }
  }
};

const createReplyView = (id, operationType) => {
  let div = document.createElement("div");
  div.setAttribute("data-parentId", id);
  div.innerHTML = `<input type="text"> <a href="#">${operationType}</a>`;
  return div;
};

const addNewChildComment = (allComments, newComment) => {
  for (let i of allComments) {
    if (i.commentId === newComment.parentCommentId) {
      i.childComments.push(newComment);
    } else if (i.childComments.length > 0) {
      addNewChildComment(i.childComments, newComment);
    }
  }
};

const recusiveView = (commentList) => {
  let fullView = "";
  for (let i of commentList) {
    fullView += commentCard(i);
    if (i.childComments.length > 0) {
      fullView += recusiveView(i.childComments);
    }
  }
  return fullView;
};

let finalComments = () => {
  if (comments) {
    const allComments = recusiveView(comments);
    commentList.innerHTML = allComments;
  }
};

const addComment = () => {
  if (inputComment.value === "") return;
  comments.push({
    parentCommentId: counter++,
    commentId: Math.random().toString().substr(2, 7),
    commentText: inputComment.value,
    childComments: [],
    Likes: 0,
  });
  finalComments();
  inputComment.value = "";
};

commentList.addEventListener("click", (e) => {
  if (e.target.innerText === "Reply") {
    const parentId = !e.target.parentNode.getAttribute("data-parentId")
      ? e.target.parentNode.getAttribute("data-parentId")
      : e.target.parentNode.getAttribute("id");
    const currentParentComment = e.target.parentNode;
    currentParentComment.appendChild(createReplyView(parentId, "Add Comment"));
    e.target.style.display = "none";
    e.target.nextSibling.style.display = "none";
  } else if (e.target.innerText === "Add Comment") {
    const parentId = e.target.parentNode.getAttribute("data-parentId")
      ? e.target.parentNode.getAttribute("data-parentId")
      : e.target.parentNode.getAttribute("id");
    const newAddedComment = {
      parentCommentId: parentId,
      commentId: Math.random().toString().substr(2, 7),
      commentText: e.target.parentNode.firstChild.value,
      childComments: [],
      Likes: 0,
    };
    addNewChildComment(comments, newAddedComment);
    finalComments();
  } else if (e.target.innerText === "Likes") {
    increaseLike(comments, e.target.parentNode.id);
    finalComments();
  } else if (e.target.innerText === "Delete") {
    const parentId = e.target.parentNode.getAttribute("id");
    deleteComment(comments, parentId);
    finalComments();
  }
});
