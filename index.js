
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

import { getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    onSnapshot,
    query,
    where,
    orderBy 
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js'


const firebaseConfig = {
  apiKey: "AIzaSyBufCkAZ9ih2qg-bNLLHASCBSUbTQqZ7f0",
  authDomain: "moody-38902.firebaseapp.com",
  projectId: "moody-38902",
  storageBucket: "moody-38902.appspot.com",
  messagingSenderId: "843665592758",
  appId: "1:843665592758:web:d95b9da529bbadc0d2b117"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)




const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")

const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")

const signOutButtonEl = document.getElementById("sign-out-btn")

const userProfilePictureEl = document.getElementById("user-profile-picture")
const userGreetingEL = document.getElementById("user-greeting")

const moodEmojiEls = document.getElementsByClassName("mood-emoji-btn")
const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-btn")

// const fetchPostsButtonEl = document.getElementById("fetch-posts-btn")

const postsEl = document.getElementById("posts")

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)

for (let moodEmojiEl of moodEmojiEls) {
    moodEmojiEl.addEventListener("click", selectMood)
}

postButtonEl.addEventListener("click", postButtonPressed)

// fetchPostsButtonEl.addEventListener("click", fetchOnceAndRenderPostsFromDB)

/* === State === */

let moodState = 0

/* === Global Constants === */

const collectionName = "posts"



/* === Main Code === */

function authState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            showProfilePicture(userProfilePictureEl, user)
            showUserGreeting(userGreetingEL, user)
            showLoggedInView()
            fetchInRealtimeAndRenderPostsFromDB(user)
        } else {
            showLoggedOutView()
        }
      })
}

authState()

/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {

    signInWithPopup(auth, provider)
    .then((result) => {
        console.log("Sign in with Google")
    })
    .catch((error) => {
       console.error(error.message)
    })
    // 
}

function authSignInWithEmail() {
    const email = emailInputEl.value
    const password = passwordInputEl.value

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        })
        .catch((error) => {
            console.error(error.message)  
        }
    )
}

function authCreateAccountWithEmail() {
   
   const email = emailInputEl.value
   const password = passwordInputEl.value

   createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        clearAuthFields()
    })
    .catch((error) => {
       console.error(error.message)
    })
}

function authSignOut(){
    signOut(auth).then(() => {
        showLoggedOutView()
        clearAuthFields()
    })
    .catch((error) => {
        console.error(error.message)
    })
}


// Functions for Firestore

async function addPostToDB(postBody, user) {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            body: postBody,
            uid: user.uid,
            createdAt: serverTimestamp(),
            mood: moodState
        })
        console.log("Document written with ID: ", docRef.id)
    } catch (error) {
        console.error(error.message)
    }

}


function fetchInRealtimeAndRenderPostsFromDB(user) {
    const postsRef = collection(db, collectionName)
    const q = query(postsRef, where("uid", "==", user.uid), orderBy("createdAt", "desc"))
    onSnapshot(q, (querySnapshot) => {

        clearAll(postsEl)
        querySnapshot.forEach((doc) => {
            const postData = doc.data()
            renderPost(postsEl, postData)
        })

    })
}

// async function fetchOnceAndRenderPostsFromDB() {
//     const querySnapshot = await getDocs(collection(db, "posts"))

//     clearAll(postsEl)

//     querySnapshot.forEach((doc) => {
//         const postData = doc.data()
//         renderPost(postsEl, postData)
//     })
// }





/* == Functions - UI Functions == */

function postButtonPressed() {
    const postBody = textareaEl.value
    const user = auth.currentUser
    if (postBody && moodState) {
        addPostToDB(postBody, user)
        clearField(textareaEl)
        resetAllMoodElements(moodEmojiEls)
    }
}

function renderPost(postsEl, postData) {
    postsEl.innerHTML += `
        <div class="post">
            <div class="header">
                <h3> ${displayDate(postData.createdAt)} </h3>
                <img src="assets/emojis/${postData.mood}.png">
            </div>
            <p>
                ${replaceNewlinesWithBrTags(postData.body)}
            </p>
        </div>
    `
}

function replaceNewlinesWithBrTags(inputString) {
   return inputString.replace(/\n/g,"<br>")
}


function showLoggedOutView() {
    hideView(viewLoggedIn)
    showView(viewLoggedOut)
}

function showLoggedInView() {
    hideView(viewLoggedOut)
    showView(viewLoggedIn)
}

function showView(view) {
    view.style.display = "flex"
}

function hideView(view) {
    view.style.display = "none"
}

function clearField(field){
    field.value = ""
}

function clearAll(element) {
    element.innerHTML = ""
}

function clearAuthFields(){
    clearField(emailInputEl)
    clearField(passwordInputEl)
}

function showProfilePicture(imgElement, user) {
    const photoURL = user.photoURL

    if (photoURL) {
        imgElement.src = photoURL
    }else{
        imgElement.src = "./assets/images/profile-default.jpg"
    }
}

function showUserGreeting(element, user){
    if (user !== null) {
        const displayName = user.displayName;
        if (displayName) {
            const userFirstName = displayName.split(" ")[0]
            element.textContent = `Hey ${userFirstName}, how are you?`
        }else{
            element.textContent = "Hey friend, how are you?"
        }
    }
}

function displayDate(firebaseDate) {
    if (!firebaseDate) {
        return "Date processing"
    }
    const date = firebaseDate.toDate()
    
    const day = date.getDate()
    const year = date.getFullYear()
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]

    let hours = date.getHours()
    let minutes = date.getMinutes()
    hours = hours < 10 ? "0" + hours : hours
    minutes = minutes < 10 ? "0" + minutes : minutes

    return `${day} ${month} ${year} - ${hours}:${minutes}`
}


/* = Functions - UI Functions - Mood = */

function selectMood(event) {
    const selectedMoodEmojiElementId = event.currentTarget.id
    
    changeMoodsStyleAfterSelection(selectedMoodEmojiElementId, moodEmojiEls)
    
    const chosenMoodValue = returnMoodValueFromElementId(selectedMoodEmojiElementId)
    
    moodState = chosenMoodValue
}

function changeMoodsStyleAfterSelection(selectedMoodElementId, allMoodElements) {
    for (let moodEmojiEl of moodEmojiEls) {
        if (selectedMoodElementId === moodEmojiEl.id) {
            moodEmojiEl.classList.remove("unselected-emoji")          
            moodEmojiEl.classList.add("selected-emoji")
        } else {
            moodEmojiEl.classList.remove("selected-emoji")
            moodEmojiEl.classList.add("unselected-emoji")
        }
    }
}

function resetAllMoodElements(allMoodElements) {
    for (let moodEmojiEl of allMoodElements) {
        moodEmojiEl.classList.remove("selected-emoji")
        moodEmojiEl.classList.remove("unselected-emoji")
    }
    
    moodState = 0
}

function returnMoodValueFromElementId(elementId) {
    return Number(elementId.slice(5))
}