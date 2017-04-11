<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>


<!DOCTYPE html>
<html lang="en">
<head>
<title>Mock SSOi Login</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<c:url value="/resources" var="resources"/>
<c:url value="/login" var="login"/>

<link href="${resources}/css/bootstrap.min.css" rel="stylesheet" media="screen">
<c:url value="/login" var="login"/>

<!--[if lt IE 9]>
	<script src="${resources}/js/html5shiv.min.js"></script>
	<script src="${resources}/js/respond.min.js"></script>
<![endif]-->

<style type="text/css">
.center-text {
	height: 100%;
	width: 100%;
	text-align: center;
}
.required::after {
	content: "*";
	padding-left:1%;
}
.form-control {
	width:97%;
	float:left;
}
</style>
</head>
<body>
	<div class="container">
		<div class="jumbotron">
			<div class="center-text">
				<h1>Mock SSOi Login</h1>
			</div>
		</div>
		<div class="row">
			<div class="panel panel-info col-sm-10 center-text">
				<div class="panel-body">
					<form data-toggle="validator" class="form-horizontal" action="${login}" method="post" id="loginForm" role="form">
						<div class="form-group">
							<label class="control-label col-sm-2" for="username">Username:</label>
							<div class="col-sm-10">
								<input type="text" class="form-control required" id="username" name="username" placeholder="Enter username" required autofocus>
							</div>
						</div>
						<div class="form-group">
							<label class="control-label col-sm-2" for="pwd">Password:</label>
							<div class="col-sm-10">
								<input type="password" class="form-control required" id="pwd" name="pwd" placeholder="Enter password" required>
							</div>
						</div>

						<input type="hidden" id="targetURL" name="targetURL" value="${param.TARGET}"> 
						<div class="col-sm-offset-2 col-sm-10">
							<input class="form-control btn btn-success" type="submit" id="button" value="Login...">
						</div>
					</form>
				</div>
			</div>
		</div>
		<div id="warning" class="row">
			<div class="panel panel-danger">
				<div class="panel-body">
					<div>${errMsg}</div>
				</div>
			</div>
		</div>
	</div>

	<script src="${resources}/js/jquery-2.1.4.min.js"></script>
	<script src="${resources}/js/bootstrap.min.js"></script>
	<script src="${resources}/js/validator.js"></script>

	<script>                     

		$(document).ready(function() {

			var noError = "<%= request.getParameter("loginError") %>";
			if (noError) {
				$('#warning').hide();
			} else {
				$('#warning').show();
			}
			
			$("#targetURL").val("<%= request.getParameter("TARGET") %>");

			
			
		});
	</script>
</body>
</html>
