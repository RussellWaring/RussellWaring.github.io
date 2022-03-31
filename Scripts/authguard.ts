"use strict";
((function()
{
    // No slash? "sanitized"
    let protected_routes: string[] = [
        "contact-list"
    ];

    // indexOf returns the first occurance of a value in an array, or a -1 if not found
    if(protected_routes.indexOf(router.ActiveLink) > -1)
    {
        // check if user is logged in
        if(!sessionStorage.getItem("user"))
        {
            // redirect to login page
            location.href = "/login";
        }
    }
    
}))();