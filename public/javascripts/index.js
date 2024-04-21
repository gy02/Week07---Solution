// Function to insert a todo item into the list
const insertTodoInList = (todo) => {
    console.log('run insertTodoInList()')
    if (todo.text) {
        const copy = document.getElementById("todo_template").cloneNode()
        copy.removeAttribute("id") // otherwise this will be hidden as well
        copy.innerText = todo.text
        // copy.setAttribute("data-todo-id", todo.id)
        copy.setAttribute("data-todo-id", todo.todoId)

        // Insert sorted on string text order - ignoring case
        const todolist = document.getElementById("todo_list")
        const children = todolist.querySelectorAll("li[data-todo-id]")
        let inserted = false
        for (let i = 0; (i < children.length) && !inserted; i++) {
            const child = children[i]
            const copy_text = copy.innerText.toUpperCase()
            const child_text = child.innerText.toUpperCase()
            if (copy_text < child_text) {
                todolist.insertBefore(copy, child)
                inserted = true
            }
        }
        if (!inserted) { // Append child
            todolist.appendChild(copy)
        }
    }
}

// Register service worker to control making site work offline
window.onload = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: '/'})
            .then(function (reg) {
                console.log('Service Worker Registered!', reg);
            })
            .catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }

    // Check if the browser supports the Notification API
    if ("Notification" in window) {
        // Check if the user has granted permission to receive notifications
        if (Notification.permission === "granted") {
            console.log('granted')
            // Notifications are allowed, you can proceed to create notifications
            // Or do whatever you need to do with notifications
        } else if (Notification.permission !== "denied") {
            console.log('permission !== "denied')
            // If the user hasn't been asked yet or has previously denied permission,
            // you can request permission from the user
            Notification.requestPermission().then(function (permission) {
                // If the user grants permission, you can proceed to create notifications
                if (permission === "granted") {
                    navigator.serviceWorker.ready
                        .then(function (serviceWorkerRegistration) {
                            serviceWorkerRegistration.showNotification("Todo App",
                                {body: "Notifications are enabled!",
                                        icon: '/images/icon.webp'}) // 指定图标的 URL
                                .then(r =>
                                    console.log(r)
                                );
                        });
                }
            });
        }else
            console.log('permission denied')
    }else
        console.log('no notification in window');

    if (navigator.onLine) {
        fetch('http://localhost:3000/todos')
            .then(function (res) {
                console.log('fetch(http://localhost:3000/todos)')
                return res.json();
            }).then(function (newTodos) {
            openTodosIDB().then((db) => {
                insertTodoInList(db, newTodos)
                getAllTodos(db).then(todos=>{
                    //如果是第一次连接（IDB没有数据：长度=0）
                    if (todos.length===0){
                        //添加所有todo
                        addNewTodosToIDB(db, newTodos).then(() => {
                            console.log("All new todos added to IDB")
                        })
                    }
                    //如果不是，判断todo的长度是否相同
                    else {//相同 则正确
                        //否则重新添加
                        if (todos.length!==newTodos.length){
                            deleteAllExistingTodosFromIDB(db).then(() => {
                                console.log('deleteAllExistingTodosFromIDB')
                                addNewTodosToIDB(db, newTodos).then(() => {
                                    console.log("All new todos added to IDB")
                                })
                            });
                        }
                    }
                })

            });
        });

    } else {
        console.log("Offline mode")
        openTodosIDB().then((db) => {
            getAllTodos(db).then((todos) => {
                for (const todo of todos) {
                    insertTodoInList(todo)
                }
            });
        });

    }
}