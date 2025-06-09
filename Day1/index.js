document.getElementById("submit_button").addEventListener("click", function (event) {
    event.preventDefault()
    validateForm();
});


function validateForm() {

    var x = document.getElementById("user_name").value;

    if (x == "") {
        alert("Name must be filled out");
        document.getElementById("user_name").focus();
        return false;
    }

    var y = document.getElementById("comments").value;

    if (y == "") {
        alert("Comments should be added before sumitting form");
        document.getElementById("comments").focus();
        return false;
    }

    var m1 = document.getElementById("male").checked;
    var m2 = document.getElementById("female").checked;

    if(m1==false && m2==false){
        alert("Please select at least one gender");
        document.getElementsByName('gender')[0].focus();
        return false;
    }

    document.getElementById("user_name").value = "";
    document.getElementById("comments").value = "";
    document.getElementById("male").checked = false;
    document.getElementById("female").checked = false;
    alert("Form submitted sussesfully");

}
