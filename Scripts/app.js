"use strict";
(function () {
    function AuthGuard() {
        let protected_routes = [
            "contact-list",
            "task-list"
        ];
        if (protected_routes.indexOf(router.ActiveLink) > -1) {
            if (!sessionStorage.getItem("user")) {
                router.ActiveLink = "login";
            }
        }
    }
    function LoadLink(link, data = "") {
        router.ActiveLink = link;
        AuthGuard();
        router.LinkData = data;
        history.pushState({}, "", router.ActiveLink);
        document.title = router.ActiveLink.substring(0, 1).toUpperCase() +
            router.ActiveLink.substring(1);
        $("ul>li>a").each(function () {
            $(this).removeClass("active");
        });
        $(`li>a:contains(${document.title})`).addClass("active");
        LoadContent();
    }
    function AddNavigationEvents() {
        let navLinks = $("ul>li>a");
        navLinks.off("click");
        navLinks.off("mouseover");
        navLinks.on("click", function () {
            LoadLink($(this).attr("data"));
        });
        navLinks.on("mouseover", function () {
            $(this).css("cursor", "pointer");
        });
    }
    function AddLinkEvents(link) {
        let linkQuery = $(`a.link[data=${link}]`);
        linkQuery.off("click");
        linkQuery.off("mouseover");
        linkQuery.off("mouseout");
        linkQuery.css("text-decoration", "underline");
        linkQuery.css("color", "blue");
        linkQuery.on("click", function () {
            LoadLink(`${link}`);
        });
        linkQuery.on("mouseover", function () {
            $(this).css("cursor", "pointer");
            $(this).css("font-weight", "bold");
        });
        linkQuery.on("mouseout", function () {
            $(this).css("font-weight", "normal");
        });
    }
    function LoadHeader() {
        $.get(`./Views/components/header.html`, function (html_data) {
            $("header").html(html_data);
            //ToggleLoginTabs();
            
            toggleLogin(); // add login / logout and secure links
            AddNavigationEvents();
        });
    }

    function ToggleTabs()
    {
        // if user is logged in
        if(sessionStorage.getItem("user"))
        {
            if($("#contact-list").length)
            {
                // do nothing
            }        
            else
            {
                $(`<li class="nav-item">
                <a id="contact-list" data="contact-list" class="nav-link" aria-current="page"><i class="fas fa-users fa-lg"></i> Contact List</a>
                </li>`).insertBefore(`li:nth-child(5)`);

                $(`<li class="nav-item">
                <a id="task-list" data="task-list" class="nav-link" aria-current="page"> Task List</a>
                </li>`).insertBefore("li:nth-child(5)");
            }     
            
        }
        else
        {
            $("li").remove("#contact-list");
            $("li").remove("#task-list");
        }
    }

    function LoadContent() {
        let page_name = router.ActiveLink;
        let callback = ActiveLinkCallBack();
        $.get(`./Views/content/${page_name}.html`, function (html_data) {
            $("main").html(html_data);
            callback();
        });
    }
    function LoadFooter() {
        $.get(`./Views/components/footer.html`, function (html_data) {
            $("footer").html(html_data);
        });
    }
    function DisplayHomePage() {
        console.log("Home Page");
        $("#AboutUsButton").on("click", () => {
            LoadLink("about");
        });
        $("main").append(`<p id="MainParagraph" class="mt-3">This is the Main Paragraph</p>`);
        $("main").append(`
        <article">
            <p id="ArticleParagraph" class="mt-3">This is the Article Paragraph</p>
            </article>`);
    }
    function DisplayAboutPage() {
        console.log("About Page");
    }
    function DisplayProductsPage() {
        console.log("Our Products Page");
    }
    function DisplayServicesPage() {
        console.log("Our Services Page");
    }
    function AddContact(fullName, contactNumber, emailAddress) {
        let contact = new core.Contact(fullName, contactNumber, emailAddress);
        if (contact.serialize()) {
            let key = contact.FullName.substring(0, 1) + Date.now();
            localStorage.setItem(key, contact.serialize());
        }
    }
    function ValidateField(input_field_ID, regular_expression, error_message) {
        let messageArea = $("#messageArea").hide();
        $("#" + input_field_ID).on("blur", function () {
            let inputFieldText = $(this).val();
            if (!regular_expression.test(inputFieldText)) {
                $(this).trigger("focus").trigger("select");
                messageArea.addClass("alert alert-danger").text(error_message).show();
            }
            else {
                messageArea.removeAttr("class").hide();
            }
        });
    }
    function ContactFormValidation() {
        ValidateField("fullName", /^([A-Z][a-z]{1,3}\.?\s)?([A-Z][a-z]{1,})+([\s,-]([A-Z][a-z]{1,}))*$/, "Please enter a valid Full Name.");
        ValidateField("contactNumber", /^(\+\d{1,3}[\s-.])?\(?\d{3}\)?[\s-.]?\d{3}[\s-.]?\d{4}$/, "Please enter a valid Contact Number.");
        ValidateField("emailAddress", /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}/, "Please enter a valid Email Address.");
    }
    function DisplayContactPage() {
        console.log("Contact Page");
        $("a[data='contact-list']").off("click");
        $("a[data='contact-list']").on("click", function () {
            LoadLink("contact-list");
        });
        ContactFormValidation();
        let sendButton = document.getElementById("sendButton");
        let subscribeCheckbox = document.getElementById("subscribeCheckbox");
        sendButton.addEventListener("click", function () {
            if (subscribeCheckbox.checked) {
                let fullName = document.forms[0].fullName.value;
                let contactNumber = document.forms[0].contactNumber.value;
                let emailAddress = document.forms[0].emailAddress.value;
                AddContact(fullName, contactNumber, emailAddress);
            }
        });
    }
    function DisplayContactListPage() {
        console.log("Contact-List Page");
        if (localStorage.length > 0) {
            let contactList = document.getElementById("contactList");
            let data = "";
            let keys = Object.keys(localStorage);
            let index = 1;
            for (const key of keys) {
                let contactData = localStorage.getItem(key);
                let contact = new core.Contact();
                contact.deserialize(contactData);
                data += `<tr>
                <th scope="row" class="text-center">${index}</th>
                <td>${contact.FullName}</td>
                <td>${contact.ContactNumber}</td>
                <td>${contact.EmailAddress}</td>
                <td class="text-center"><button value="${key}" class="btn btn-primary btn-sm edit"><i class="fas fa-edit fa-sm"></i> Edit</button></td>
                <td class="text-center"><button value="${key}" class="btn btn-danger btn-sm delete"><i class="fas fa-trash-alt fa-sm"></i> Delete</button></td>
                </tr>
                `;
                index++;
            }
            contactList.innerHTML = data;
            $("button.delete").on("click", function () {
                if (confirm("Are you sure?")) {
                    localStorage.removeItem($(this).val());
                }
                LoadLink("contact-list");
            });
            $("button.edit").on("click", function () {
                LoadLink("edit", $(this).val());
            });
        }
        $("#addButton").on("click", () => {
            LoadLink("edit", "add");
        });
    }
    function DisplayEditPage() {
        console.log("Edit Page");
        ContactFormValidation();
        let page = router.LinkData;
        switch (page) {
            case "add":
                {
                    $("main>h1").text("Add Contact");
                    $("#editButton").html(`<i class="fas fa-plus-circle fa-lg"></i> Add`);
                    $("#editButton").on("click", (event) => {
                        event.preventDefault();
                        let fullName = document.forms[0].fullName.value;
                        let contactNumber = document.forms[0].contactNumber.value;
                        let emailAddress = document.forms[0].emailAddress.value;
                        AddContact(fullName, contactNumber, emailAddress);
                        LoadLink("contact-list");
                    });
                    $("#cancelButton").on("click", () => {
                        LoadLink("contact-list");
                    });
                }
                break;
            default:
                {
                    let contact = new core.Contact();
                    contact.deserialize(localStorage.getItem(page));
                    $("#fullName").val(contact.FullName);
                    $("#contactNumber").val(contact.ContactNumber);
                    $("#emailAddress").val(contact.EmailAddress);
                    $("#editButton").on("click", (event) => {
                        event.preventDefault();
                        contact.FullName = $("#fullName").val();
                        contact.ContactNumber = $("#contactNumber").val();
                        contact.EmailAddress = $("#emailAddress").val();
                        localStorage.setItem(page, contact.serialize());
                        LoadLink("contact-list");
                    });
                    $("#cancelButton").on("click", () => {
                        LoadLink("contact-list");
                    });
                }
                break;
        }
    }

    function toggleLogin()
    {
      // if user is logged in
      if(sessionStorage.getItem("user"))
      {
        // swap out the login link for logout
        $("#loginListItem").html(
        `<a id="logout" class="nav-link" aria-current="page"><i class="fas fa-sign-out-alt"></i> Logout</a>`
        );

        $("#logout").on("click", function()
        {
          // perform logout
          sessionStorage.clear();
          //$("li").remove("#contact-list");
          //$("li").remove("#task-list");

          // redirect back to login
          LoadLink("login");
        });

        // make it look like each nav item is an active link
        $("#logout").on("mouseover", function()
        {
          $(this).css('cursor', 'pointer');
        });

        $("#tasklist").on("mouseover", function()
        {
          $(this).css('cursor', 'pointer');
        });
     
        $(`<li class="nav-item">
        <a id="contact-list" class="nav-link" aria-current="page"><i class="fas fa-users fa-lg"></i> Contact List</a>
        </li>`).insertBefore("#loginListItem");

        $(`<li class="nav-item">
        <a id="task-list" class="nav-link" aria-current="page"><i class="fas fa-list"></i> Task List</a>
        </li>`).insertBefore("#loginListItem");

      }
      else
      {
        // swap out the login link for logout
        $("#loginListItem").html(
          `<a data="login" class="nav-link" aria-current="page"><i class="fas fa-sign-in-alt"></i> Login</a>`
          );
      }
    }

    function DisplayLoginPage() {
        console.log("Login Page");
        let messageArea = $("#messageArea");
        messageArea.hide();
        AddLinkEvents("register");
        $("#loginButton").on("click", function () {
            let success = false;
            let newUser = new core.User();
            let username = document.forms[0].username.value;
            let password = document.forms[0].password.value;
            $.get("./Data/users.json", function (data) {
                for (const user of data.users) {
                    if (username == user.Username && password == user.Password) {
                        console.log("conditional passed");
                        newUser.fromJSON(user);
                        success = true;
                        break;
                    }
                }
                if (success) {
                    sessionStorage.setItem("user", newUser.serialize());
                    messageArea.removeAttr("class").hide();
                    LoadLink("contact-list");
                }
                else {
                    $("#username").trigger("focus").trigger("select");
                    messageArea.addClass("alert alert-danger").text("Error: Invalid Login Credentials").show();
                }
            });
        });
        $("#cancelButton").on("click", function () {
            document.forms[0].reset();
            LoadLink("home");
        });
    }
    function DisplayRegisterPage() {
        console.log("Register Page");
        AddLinkEvents("login");
    }
    function Display404Page() {
        console.log("404 Page");
    }
    function ActiveLinkCallBack() {
        switch (router.ActiveLink) {
            case "home": return DisplayHomePage;
            case "about": return DisplayAboutPage;
            case "products": return DisplayProductsPage;
            case "services": return DisplayServicesPage;
            case "contact": return DisplayContactPage;
            case "contact-list": return DisplayContactListPage;
            case "edit": return DisplayEditPage;
            case "login": return DisplayLoginPage;
            case "register": return DisplayRegisterPage;
            case "task-list": return DisplayTaskList;
            case "404": return Display404Page;
            default:
                console.error("ERROR: callback does not exist: " + router.ActiveLink);
                return new Function;
        }
    }

    /**
     * This function is the Callback function for the TaskList
     *
     */
     function DisplayTaskList()
     {
 
         console.log("Task list page")
 
         let messageArea = $("#messageArea");
         messageArea.hide();
         let taskInput = $("#taskTextInput");
 
         // add a new Task to the Task List
         $("#newTaskButton").on("click", function()
         {         
             AddNewTask();
         });
 
         taskInput.on("keypress", function(event)
         {
           if(event.key == "Enter")
           {
             AddNewTask();
           }
          });
 
         // Edit an Item in the Task List
         $("ul").on("click", ".editButton", function(){
            let editText = $(this).parent().parent().children(".editTextInput");
            let text = $(this).parent().parent().text();
            editText.val(text).show().trigger("select");
            editText.on("keypress", function(event)
            {
             if(event.key == "Enter")
             {
               if(editText.val() != "" && editText.val().charAt(0) != " ")
               {
                 editText.hide();
                 $(this).parent().children("#taskText").text(editText.val());
                 messageArea.removeAttr("class").hide();
               }
               else
               {
                 editText.trigger("focus").trigger("select");
                 messageArea.show().addClass("alert alert-danger").text("Please enter a valid Task.");
               }
             }
            });
         });
 
         // Delete a Task from the Task List
         $("ul").on("click", ".deleteButton", function(){
             if(confirm("Are you sure?"))
             {
                 $(this).closest("li").remove();
             }    
         });
     }


    function Start() {
        console.log("App Started!");
        LoadHeader();
        LoadLink("home");
        LoadFooter();
    }
    window.addEventListener("load", Start);
})();