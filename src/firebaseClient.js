import firebase from "firebase";
import "firebase/auth";

// if (typeof window !== "undefined" && !firebase.apps.length) {
//     firebase.initializeApp({
//         apiKey: "AIzaSyC-Jna5XTa18AO8iGSK-zUZ-6SexWc3ZLU",
//         authDomain: "nec-bi-dev.firebaseapp.com",
//         databaseURL: "https://nec-bi-dev.firebaseio.com",
//         projectId: "nec-bi-dev",
//         storageBucket: "nec-bi-dev.appspot.com",
//         messagingSenderId: "678634054043",
//         appId: "1:678634054043:web:b654de9fbed3c5860a413e",
//     });

//     firebase.auth().languageCode = "vi";
// }

// New 2021/01/28

// if (typeof window !== "undefined" && !firebase.apps.length) {
//     firebase.initializeApp({
//         apiKey: "AIzaSyB1eTxKBCIj167Rg5GbLZ0X3XrClV2skRE",
//         authDomain: "il-coreda-delivery.firebaseapp.com",
//         projectId: "il-coreda-delivery",
//         storageBucket: "il-coreda-delivery.appspot.com",
//         messagingSenderId: "700391547518",
//         appId: "1:700391547518:web:d94db6a7f89b74df156e2f",
//         measurementId: "G-EZ3L9PK83W"
//     });
//     firebase.auth().languageCode = "vi";
// }

if (typeof window !== "undefined" && !firebase.apps.length) {
    const firebaseConfig = {
        apiKey: "AIzaSyCMFDpZ1BbUpU5avyB74jEf0yjrNloVc2M",
        authDomain: "zensho-delivery.firebaseapp.com",
        projectId: "zensho-delivery",
        storageBucket: "zensho-delivery.appspot.com",
        messagingSenderId: "644166778293",
        appId: "1:644166778293:web:a4695f3e05738467272dfc",
        measurementId: "G-EP3RENS2TX"
    };
    firebase.initializeApp({
        ...firebaseConfig
    });
    firebase.auth().languageCode = "vi";
}

export { firebase };


