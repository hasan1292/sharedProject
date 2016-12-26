/**
 * Created by thomas on 2016-12-23.
 */
    function setActiveTab(tab)
{
    document.getElementById("nav1").className = ""
    document.getElementById("nav2").className = ""
    document.getElementById("nav3").className = ""
    document.getElementById("nav4").className = "navbar-right"
    if(tab=="home") {
        document.getElementById("nav1").className = "active"
    }
    else if(tab=="requestHelp") {
        document.getElementById("nav2").className = "active"
    }
    else if(tab=="myPosts") {
        document.getElementById("nav3").className = "active"
    }
    else if(tab=="profile") {
        document.getElementById("nav4").className = "navbar-right active"
    }
}

