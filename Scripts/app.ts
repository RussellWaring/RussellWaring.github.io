// IIFE -- Immediately Invoked Function Expression
// AKA -- Anonymous Self-Executing Function
(function()
{
    // Utility Functions
    /**
     * Authorization Guard method checks whether a user is logged in. A gate-keeper to accessing other pages.
     *
     */
    function AuthGuard(): void
    {
        let protected_routes: string[] = [
            "contact-list"
        ];
    
        // indexOf returns the first occurance of a value in an array, or a -1 if not found
        if(protected_routes.indexOf(router.ActiveLink) > -1)
        {
            // check if user is logged in
            if(!sessionStorage.getItem("user"))
            {
                // if not... change the active link to "login"
                router.ActiveLink = "login";
            }
        }
    }

    // Workhorse function
    function LoadLink(link: string, data: string = ""): void
    {
        router.ActiveLink = link;

        AuthGuard();

        router.LinkData = data;
        // Attacks the URL in the browser
        history.pushState({}, "", router.ActiveLink);

        // Capitalize the router activeLink and set the title to it
        document.title = router.ActiveLink.substring(0, 1).toUpperCase() + router.ActiveLink.substring(1);

        // Remove all active links
        $("ul>li>a").each(function()
        {
            $(this).removeClass("active");
        });

        $(`li>a:contains(${document.title})`).addClass("active");

        LoadContent();
    }

    // Fool the user that the links are real
    function AddNavigationEvents(): void
    {
        let navLinks = $("ul>li>a"); // find all navigation links

        // remove navigation events
        navLinks.off("click");
        navLinks.off("mouseover");


        // Loop through each navigation link and load appropriate content on click
        navLinks.on("click", function()
        {
            // Load the link tied to the data attribute
            LoadLink($(this).attr("data") as string);
        });

        // make the navigation links look like they are clickable
        navLinks.on("mouseover", function()
        {
            $(this).css("cursor", "pointer");
        });
    }

    function AddLinkEvents(link: string): void
    {
        let linkQuery = $(`a.link[data=${link}]`);

        // Remove all link events
        linkQuery.off("click");
        linkQuery.off("mouseover");
        linkQuery.off("mouseout");
        
        // Add css to adjust the link aesthetic
        linkQuery.css("text-decoration", "underline");
        linkQuery.css("color", "blue");

        // Add link events
        linkQuery.on("click", function()
        {
            LoadLink(`${link}`);
        });

        linkQuery.on("mouseover", function()
        {
            $(this).css("cursor", "pointer");
            $(this).css("font-weight", "bold");
        });

        linkQuery.on("mouseout", function()
        {
            $(this).css("font-weight", "normal");
        });
    }

    /**
     * This function loads the navbar from the header file and injects it into the page.
     * 
     * @returns {void}
     */
    function LoadHeader(): void
    {
        $.get("./Views/components/header.html", function(html_data)
        {
            $("header").html(html_data);

            AddNavigationEvents();

            CheckLogin();
        });        
    }

    /**
     *
     * 
     * @returns {void}
     */
    function LoadContent(): void
    {
        let page_name: string = router.ActiveLink; // alias
        let callback: Function = ActiveLinkCallBack();
        $.get(`./Views/content/${page_name}.html`, function(html_data)
        {
            $("main").html(html_data);

            //CheckLogin();
            
            callback();
        });

    }

    /**
     * 
     * @returns {void}
     */
    function LoadFooter(): void
    {
        $.get(`./Views/components/footer.html`, function(html_data)
        {
            $("footer").html(html_data);
        });
    }

    function DisplayHomePage(): void
    {
        console.log("Home Page");
        $("#AboutUsButton").on("click", () =>
        {
            location.href = "/about";
        });

        $("main").append(`<p id="MainParagraph" class="mt-3">This is the Main Paragraph</p>`);

        $("main").append(`
        <article">
            <p id="ArticleParagraph" class="mt-3">This is the Article Paragraph</p>
            </article>`);
        
    }

    function DisplayAboutPage(): void
    {
        console.log("About Page");
    }

    function DisplayProductsPage(): void
    {
        console.log("Our Products Page");
    }

    function DisplayServicesPage(): void
    {
        console.log("Our Services Page");
    }

    /**
     * Adds a Contact Object to localStorage
     *
     * @param {string} fullName
     * @param {string} contactNumber
     * @param {string} emailAddress
     */
    function AddContact(fullName: string, contactNumber: string, emailAddress: string)
    {
        let contact = new core.Contact(fullName, contactNumber, emailAddress);
        if(contact.serialize())
        {
            let key = contact.FullName.substring(0, 1) + Date.now();

            localStorage.setItem(key, contact.serialize() as string);
        }
    }

    /**
     * This method validates an input text field in the form and displays
     * an error in the message area
     * 
     * @param {string} input_field_ID 
     * @param {RegExp} regular_expression 
     * @param {string} error_message 
     */
    function ValidateField(input_field_ID: string, regular_expression: RegExp, error_message: string)
    {
        let messageArea = $("#messageArea").hide();

        $("#" + input_field_ID).on("blur", function()
        {
            let inputFieldText = $(this).val() as string;

            if(!regular_expression.test(inputFieldText))
            {
                $(this).trigger("focus").trigger("select");
                messageArea.addClass("alert alert-danger").text(error_message).show();
            }
            else
            {
                messageArea.removeAttr("class").hide();
            }
        });
    }

    function ContactFormValidation(): void
    {        
        ValidateField("fullName", /^([A-Z][a-z]{1,3}\.?\s)?([A-Z][a-z]{1,})+([\s,-]([A-Z][a-z]{1,}))*$/, "Please enter a valid Full Name.");
        ValidateField("contactNumber", /^(\+\d{1,3}[\s-.])?\(?\d{3}\)?[\s-.]?\d{3}[\s-.]?\d{4}$/, "Please enter a valid Contact Number.");
        ValidateField("emailAddress", /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}/, "Please enter a valid Email Address.");
    }

    function DisplayContactPage(): void
    {
        console.log("Contact Page");

        $("a[data='contact-list']").off("click");
        $("a[data='contact-list']").on("click", function()
        {
            LoadLink("contact-list");
        });

        ContactFormValidation();

        let sendButton = document.getElementById("sendButton") as HTMLElement;
        let subscribeCheckbox = document.getElementById("subscribeCheckbox") as HTMLInputElement;

        sendButton.addEventListener("click", function()
        {
            if(subscribeCheckbox.checked)
            {
                let fullName = document.forms[0].fullName.value as string;
                let contactNumber = document.forms[0].contactNumber.value as string;
                let emailAddress = document.forms[0].emailAddress.value as string;
                
                AddContact(fullName, contactNumber, emailAddress);
            }
        });
    }

    function DisplayContactListPage()
    {
        console.log("Contact-List Page");

        if(localStorage.length > 0)
        { 
            let contactList = document.getElementById("contactList") as HTMLElement;

            let data = ""; // data container -> add deserialized data from localStorage

            let keys = Object.keys(localStorage); // returns a string array of keys

            let index = 1; // counts how many keys

            // for every key in the keys array (collection), loop
            for (const key of keys)
            {
                let contactData = localStorage.getItem(key) as string; // get localStorage data value related to the key

                let contact = new core.Contact(); // create a new empty contact object

                contact.deserialize(contactData);

                // inject a repeatable row into the contact list
                data += `<tr>
                <th scope="row" class="text-center">${index}</th>
                <td>${contact.FullName}</td>
                <td>${contact.ContactNumber}</td>
                <td>${contact.EmailAddress}</td>
                <td class="text-center"><button value="${key}" class="btn btn-primary btn-sm edit"><i class="fas fa-edit fa-sm"></i> Edit</button></td>
                <td class="text-center"><button value="${key}" class="btn btn-danger btn-sm delete"><i class="fas fa-trash-alt fa-sm"></i> Delete</button></td>
                </tr>
                `;
                // C - create; R - read; U - update; D - delete; -> localStorage?
                index++;
            }
            contactList.innerHTML = data;

            // Finding button by class. Also, fat arrow looks at the entirety of the functional scope
            $("button.delete").on("click", function()
            {
                if(confirm("Are you sure?"))
                {
                    localStorage.removeItem($(this).val() as string); // big arrow would wipe all the local storage
                }
                // Refresh after deleting
                LoadLink("contact-list");
            });

            $("button.edit").on("click", function()
            {
                LoadLink("edit", $(this).val() as string);
            });
        }

        $("#addButton").on("click",() =>
        {
            LoadLink("edit", "add"); // the data part replaces the hashtag part
        });
    }

    function DisplayEditPage(): void
    {
        console.log("Edit Page");
        
        ContactFormValidation();

        // Data attribute of link replacing hash of location reference
        let page = router.LinkData;

        switch(page)
        {
            case "add": 
                {
                    $("main>h1").text("Add Contact");

                    $("#editButton").html(`<i class="fas fa-plus-circle fa-lg"></i> Add`);

                    $("#editButton").on("click", (event) =>
                    {
                        event.preventDefault();

                        let fullName = document.forms[0].fullName.value as string;
                        let contactNumber = document.forms[0].contactNumber.value as string;
                        let emailAddress = document.forms[0].emailAddress.value as string;
                        
                        AddContact(fullName, contactNumber, emailAddress);

                        LoadLink("contact-list");
                    });
                    
                    $("#cancelButton").on("click", () =>
                    {
                        LoadLink("contact-list");
                    });
                }   
                break;
            default:
                {
                    // Get the contact info from localStorage
                    let contact = new core.Contact();
                    contact.deserialize(localStorage.getItem(page) as string); // the hash
                    
                    // display the contact info in the edit form -> this is the getter
                    $("#fullName").val(contact.FullName);
                    $("#contactNumber").val(contact.ContactNumber);
                    $("#emailAddress").val(contact.EmailAddress);

                    // when editButton is pressed - update the contact
                    $("#editButton").on("click", (event)=>
                    {
                        event.preventDefault();

                        // get any changes from the form -> this is the setter
                        contact.FullName = $("#fullName").val() as string;
                        contact.ContactNumber = $("#contactNumber").val() as string;
                        contact.EmailAddress = $("#emailAddress").val() as string;

                        // replace the item in localStorage
                        localStorage.setItem(page, contact.serialize() as string);

                        // return to the contact-list
                        LoadLink("contact-list");
                    });

                    $("#cancelButton").on("click", () =>
                    {
                        LoadLink("contact-list");
                    });
                } 
                break;
        }
    }

    function CheckLogin(): void
    {
        // if user is logged in, then...
        if(sessionStorage.getItem("user"))
        {
            // swap out the login link for logout
            $("#login").html(
                `<a id="logout" class="nav-link" href="#"><i class="fa-solid fa-sign-out-alt"></i> Logout</a>`
            );

            $("#logout").on("click", function()
            {
                // perform logout
                sessionStorage.clear();

                // swap out the logout link for login
                $("#login").html(
                    `<a class="nav-link" data="login"><i class="fa-solid fa-sign-in-alt"></i> Login</a>`
                );

                // redirect back to login page
                LoadLink("login");
            })
        }
    }

    function DisplayLoginPage(): void
    {
        console.log("Login Page");
        let messageArea = $("#messageArea");
        messageArea.hide();

        AddLinkEvents("register"); // bottom of Login page there is a Register link... this could be automatic

        $("#loginButton").on("click", function()
        {
            let success = false;

            // create an empty user object
            let newUser = new core.User();

            let username = document.forms[0].username.value as string;
            let password = document.forms[0].password.value as string;
            
            // use jQuery shortcut to load the users.json file
            $.get("./Data/users.json", function(data)
            {
                //console.log(data);
                // for every user in the users.json file, loop
                for (const user of data.users) 
                {
                    //console.log(user);
                    // check if the username and password entered matches the user data
                    if(username == user.Username && password == user.Password)
                    {
                        console.log("conditional passed");
                        // get the user data from the file and assign it to our empty user object
                        newUser.fromJSON(user);
                        success = true;
                        break;
                    }                    
                }
                // if username and password matches...success! -> perform the login sequence
                if(success)
                {
                    // add user to session storage
                    sessionStorage.setItem("user", newUser.serialize() as string);

                    // hide any error message
                    messageArea.removeAttr("class").hide();

                    // redirect the user to the secure area of the site - contact-list
                    LoadLink("contact-list");
                }
                else
                {
                    // display an error message
                    $("#username").trigger("focus").trigger("select");
                    messageArea.addClass("alert alert-danger").text("Error: Invalid Login Credentials").show();
                }
            });
        });

        $("#cancelButton").on("click", function()
        {
            // clear the login form
            document.forms[0].reset();

            // return to the home page
            LoadLink("home");
        });
    }

    function DisplayRegisterPage(): void
    {
        console.log("Register Page");
        AddLinkEvents("login"); // bottom of register page there is a login 'link'
    }

    function Display404Page(): void
    {
        console.log("404 Page");
    }

    /**
     * This function returns the appropriate callback function relative to the activeLink.
     * 
     * @returns {Function} 
     */
    function ActiveLinkCallBack(): Function
    {
        switch(router.ActiveLink)
        {
            case "home": return DisplayHomePage;
            case "about": return DisplayAboutPage;
            case "products": return DisplayProductsPage;
            case "services": return DisplayServicesPage;
            case "contact": return DisplayContactPage;
            case "contact-list": return DisplayContactListPage;
            case "edit": return DisplayEditPage;
            case "login": return DisplayLoginPage;
            case "register": return DisplayRegisterPage;
            case "404": return Display404Page;
            default:
                console.error("ERROR: callback does not exist: " + router.ActiveLink);
                return new Function();
        }
    }

    /**
     * This is the entry point to the web application
     * 
     */
    function Start(): void
    {
        console.log("App Started!");

        LoadHeader();

        LoadLink("home");

        LoadFooter();
  
    }

    window.addEventListener("load", Start); 

})(); 
