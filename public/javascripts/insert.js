const addNewTodoButtonEventListener = () => {
    console.log('click add button')
    const txt_val = document.getElementById("txt_in").value
    const id=createPlantId(txt_val)
    const todo={text: txt_val,todoId:id}
    openSyncTodosIDB().then((db) => {
        addNewTodoToSync(db, todo);
        console.log(111)
    }).then(
        openTodosIDB().then(db=>{
            console.log(222)
            addNewTodosToIDB(db,[todo])
        })
    )
    navigator.serviceWorker.ready
        .then(function (serviceWorkerRegistration) {
            serviceWorkerRegistration.showNotification("Todo App",
                {
                    body: "Todo added! - " + txt_val,
                    icon: '/images/icon.webp'})
                .then(r =>
                    console.log(r)
                );
        });
}

window.onload = function () {
    // Add event listeners to buttons
    const add_btn = document.getElementById("add_btn")
    add_btn.addEventListener("click", addNewTodoButtonEventListener)
}