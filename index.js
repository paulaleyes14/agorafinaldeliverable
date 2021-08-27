$("#login-form").submit(async function (e) {
    if ($("#emailText").val().match(/\S+@\S+/)) {
        document.getElementById("emailText").setAttribute("class", "border-success")
        if ($("#passwordText").val().length == 0) {
            e.preventDefault()
            document.getElementById("passwordText").setAttribute("class", "border-danger")
        }
        else {
            document.getElementById("passwordText").setAttribute("class", "border-success")
        }
    }
    else {
        e.preventDefault()
        document.getElementById("emailText").setAttribute("class", "border-danger")
    }

})