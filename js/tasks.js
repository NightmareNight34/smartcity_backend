const form = document.querySelector('#form');
const todoContainer = document.querySelector('#todo-container');

let date = new Date();
let time = date.getTime();
let counter = time;
let todos = []



function logout()
{
    auth.signOut();
    localStorage.removeItem('todos')
}

function saveData(task)
{
    let todo =
    {
        id: task.id,
        text: task.data().text,
        completed: task.data().completed
    }
    todos.push(todo);
}

function renderData(id)
{
    let todoObj = todos.find(todo => todo.id === id);
    
    let parentDiv = document.createElement("li");
    parentDiv.setAttribute("id", todoObj.id);
    
    let todoDiv = document.createElement("p");
    todoDiv.textContent = todoObj.text.length <= 20 ? todoObj.text : todoObj.text.slice(0, 20)
    todoObj.completed ? todoDiv.classList.add('completed'): todoDiv

    let deleteButton = document.createElement("button");
    deleteButton.className = "far fa-trash-alt";
    deleteButton.classList.add("delete");
    deleteButton.classList.add("button");
    deleteButton.classList.add("hover_button");

    let completeButton = document.createElement("button");
    completeButton.className = "fa solid fa-check";
    completeButton.classList.add("finish");
    completeButton.classList.add("button");
    completeButton.classList.add("hover_button");
    
    let buttonDiv = document.createElement("div");
    buttonDiv.className = "button_div";
    buttonDiv.appendChild(deleteButton);
    buttonDiv.appendChild(completeButton);

    parentDiv.appendChild(todoDiv);
    parentDiv.appendChild(buttonDiv);
    todoContainer.appendChild(parentDiv);

    deleteButton.addEventListener('click', e => 
    {
        let id = e.target.parentElement.parentElement.getAttribute('id');
        auth.onAuthStateChanged(user =>
            {
                if(user) db.collection(user.uid).doc(id).delete();
            })
    });
    completeButton.addEventListener('click', e => 
    {
        let id = e.target.parentElement.parentElement.getAttribute('id');
        auth.onAuthStateChanged(user =>
            {
                let item = db.collection(`${user.uid}`).doc(id);
                item.get().then((doc) =>
                {
                    item.update({completed: !doc.data().completed});
                    todoDiv.classList.toggle('completed');
                    todos.map(todo => todo.id === doc.id ? todo.completed = !todo.completed : todo)
                })                
            })
    });
}
    


function filterHandler(status)
{
    if(status === "completed")
    {
        todos = JSON.parse(localStorage.getItem('todos')).filter(todo => todo.completed);
    }
    else if(status === "open")
    {
        todos = JSON.parse(localStorage.getItem('todos')).filter(todo => !todo.completed);
    }
    else
    {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    todoContainer.innerHTML = ""
    todos.forEach(todo => renderData(todo.id))    
}






form.addEventListener('submit', e => 
{
    e.preventDefault();
    const text = form['todos'].value;
    let id = counter += 1;
    form.reset();

   
   var userId = req.session.userId;
   if(userId == null)
   {
      res.redirect("/login");
      return;
   }

   var sql = "INSERT INTO `tasks`(`task_name`,`ID_user`) VALUES ('" + text + "','" + userId + "')";
   db.query(sql, function(err, results)
   {
      res.render('tasks.ejs',{data:results});
   });
   console.log(text);

});

function filterHandler(status)
{
    if(status === "completed")
    {
        todos = JSON.parse(localStorage.getItem('todos')).filter(todo => todo.completed);
    }
    else if(status === "open")
    {
        todos = JSON.parse(localStorage.getItem('todos')).filter(todo => !todo.completed);
    }
    else if(status === "add")
    {
        e.preventDefault();
        const text = form['todos'].value;
        let id = counter += 1;
        form.reset();
    
       
       var userId = req.session.userId;
       if(userId == null)
       {
          res.redirect("/login");
          return;
       }
    
       var sql = "INSERT INTO `tasks`(`task_name`,`ID_user`) VALUES ('" + text + "','" + userId + "')";
       db.query(sql, function(err, results)
       {
          res.render('tasks.ejs',{data:results});
       });
       console.log(text);
    }
    else
    {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    todoContainer.innerHTML = ""
    todos.forEach(todo => renderData(todo.id))    
}



auth.onAuthStateChanged(user => 
    {
        if(user)
        {
            db.collection(user.uid).onSnapshot((snapshot) => 
            {
                let changes = snapshot.docChanges();
                changes.forEach(change =>
                    {
                        if(change.type === "added")
                        {
                            saveData(change.doc);
                            renderData(change.doc.id);
                        } else if(change.type === "removed")
                        {
                            let li = todoContainer.querySelector(`#${change.doc.id}`);
                            todoContainer.removeChild(li);
                            todos = todos.filter((todo) => todo.id !== change.doc.id);
                        }
                    });
                    localStorage.setItem('todos', JSON.stringify(todos));
            });
        }
    });