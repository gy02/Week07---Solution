function createPlantId(plantName) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${plantName}${year}${month}${day}${hours}${minutes}${seconds}`;
}// Function to handle adding a new todo
const addNewTodoToSync = (syncTodoIDB, todo) => {
    // Retrieve todo text and add it to the IndexedDB

    if (todo !== null) {
        const transaction = syncTodoIDB.transaction(["sync-todos"], "readwrite")
        const todoStore = transaction.objectStore("sync-todos")
        const addRequest = todoStore.add(todo)
        addRequest.addEventListener("success", () => {
            console.log("Added " + "#" + addRequest.result + ": " + todo.todoId+' --> '+todo.text)
            const getRequest = todoStore.get(addRequest.result)
            getRequest.addEventListener("success", () => {
                console.log("Found " + JSON.stringify(getRequest.result))
                // Send a sync message to the service worker
                navigator.serviceWorker.ready.then((sw) => {
                    console.log('sw.sync.register("sync-todo")')
                    sw.sync.register("sync-todo")
                }).then(() => {
                    console.log("Sync registered");
                }).catch((err) => {
                    console.log("Sync registration failed: " + JSON.stringify(err))
                })
            })
        })
    }
}

// Function to add new todos to IndexedDB and return a promise
const addNewTodosToIDB = (todoIDB, todos) => {
    return new Promise((resolve, reject) => {
        const transaction = todoIDB.transaction(["todos"], "readwrite");
        const todoStore = transaction.objectStore("todos");

        const addPromises = todos.map(todo => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = todoStore.add(todo);
                addRequest.addEventListener("success", () => {
                    console.log("Added " + "#" + addRequest.result + ": " + todo.text);
                    const getRequest = todoStore.get(addRequest.result);
                    getRequest.addEventListener("success", () => {
                        console.log("Found " + JSON.stringify(getRequest.result));
                        // Assume insertTodoInList is defined elsewhere
                        insertTodoInList(getRequest.result);
                        resolveAdd(); // Resolve the add promise
                    });
                    getRequest.addEventListener("error", (event) => {
                        rejectAdd(event.target.error); // Reject the add promise if there's an error
                    });
                });
                addRequest.addEventListener("error", (event) => {
                    rejectAdd(event.target.error); // Reject the add promise if there's an error
                });
            });
        });

        // Resolve the main promise when all add operations are completed
        Promise.all(addPromises).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
};
const syncNewTodosToIDB = (todoIDB, todos) => {
    const transaction = todoIDB.transaction(["todos"], "readwrite");
    const todoStore = transaction.objectStore("todos");

}

// Function to remove all todos from idb
const deleteAllExistingTodosFromIDB = (todoIDB) => {
    const transaction = todoIDB.transaction(["todos"], "readwrite");
    const todoStore = transaction.objectStore("todos");
    const clearRequest = todoStore.clear();

    return new Promise((resolve, reject) => {
        clearRequest.addEventListener("success", () => {
            resolve();
        });

        clearRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
};


// Function to get the todo list from the IndexedDB
const getAllTodos = (todoIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = todoIDB.transaction(["todos"]);
        const todoStore = transaction.objectStore("todos");
        const getAllRequest = todoStore.getAll();

        // Handle success event
        getAllRequest.addEventListener("success", (event) => {
            resolve(event.target.result); // Use event.target.result to get the result
        });

        // Handle error event
        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}


// Function to get the todo list from the IndexedDB
const getAllSyncTodos = (syncTodoIDB) => {
    return new Promise((resolve, reject) => {
        const transaction = syncTodoIDB.transaction(["sync-todos"]);
        const todoStore = transaction.objectStore("sync-todos");
        const getAllRequest = todoStore.getAll();

        getAllRequest.addEventListener("success", () => {
            resolve(getAllRequest.result);
        });

        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

// Function to delete a syn
const deleteSyncTodoFromIDB = (syncTodoIDB, id) => {
    const transaction = syncTodoIDB.transaction(["sync-todos"], "readwrite")
    const todoStore = transaction.objectStore("sync-todos")
    const deleteRequest = todoStore.delete(id)
    deleteRequest.addEventListener("success", () => {
        console.log("Deleted id:" + id)
    })
}

function openTodosIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("todos", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            // db.createObjectStore('todos', {keyPath: '_id'});
            // db.createObjectStore('todos');
            db.createObjectStore('todos', {keyPath: 'todoId'});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

function openSyncTodosIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("sync-todos", 1);

        request.onerror = function (event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            // db.createObjectStore('sync-todos', {keyPath: 'id', autoIncrement: true});
            db.createObjectStore('sync-todos', {keyPath: 'todoId'});
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };
    });
}

