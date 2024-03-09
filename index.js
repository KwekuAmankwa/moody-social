
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

    import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js'

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

const textareaEl = document.getElementById("post-input")
const postButtonEl = document.getElementById("post-btn")


/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)

signOutButtonEl.addEventListener("click", authSignOut)

postButtonEl.addEventListener("click", postButtonPressed)


/* === Main Code === */

function authState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            showProfilePicture(userProfilePictureEl, user)
            showUserGreeting(userGreetingEL, user)
            showLoggedInView()
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
        const docRef = await addDoc(collection(db, "posts"), {
            body: postBody,
            uid: user
        })
        console.log("Document written with ID: ", docRef.id)
    } catch (error) {
        console.error(error.message)
    }

}

/* == Functions - UI Functions == */

function postButtonPressed() {
    const postBody = textareaEl.value
    const user = auth.currentUser
    if (postBody) {
        addPostToDB(postBody, user)
        clearField(textareaEl)
    }
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