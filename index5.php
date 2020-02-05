<?php include_once("phpbb.php");
// check for logout request
$cp = $request->variable('cp', '');
// is it a logout? then kill the session!
if ($cp == "logout") {
$user->session_kill();
$user->session_begin();
echo "Successfully Logged Out.";
}
?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>phpBB conn test</title>
</head>
<body>
<?php
// Page login notice
if ($user->data['user_id'] == ANONYMOUS)
{
?>
<center>Welcome! Please login below or click <a href="forum/ucp.php?mode=register">here</a> to register.<br />
<form method="POST" action="forum/ucp.php?mode=login">
Username: <input type="text" name="username" size="20"><br />
Password: <input type="password" name="password" size="20"><br />
Remember Me?: <input type="checkbox" name="autologin"><br />
<input type="submit" value="Login" name="login">
<input type="hidden" name="redirect" value="../somefile.php">
</form>
<?php
} else { ?>
Welcome back, <?php echo $user->data['username_clean']; ?> | You have <?php echo $user->data['user_unread_privmsg']; ?> new messages | <a href="somefile.php?cp=logout">Log Out</a>
<?php } ?>
</body>
</html>