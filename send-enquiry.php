<?php
/* Join Us form -> email to the membership team.
   join.html posts each enquiry here and this script emails it to ENQUIRY_TO, with the
   parent's address as Reply-To so the team can just press Reply. (The page then saves a
   back-up copy to the database for the members' area: see supabase/migrations/035_enquiries.sql.)
   Runs on the IONOS web hosting's own PHP mail, so there's nothing to set up or log in to.
   To send enquiries somewhere else, change ENQUIRY_TO. ENQUIRY_FROM must stay a real
   club mailbox at IONOS, or the email may be rejected as spam. */

const ENQUIRY_TO   = 'info@phoenixbasildonsc.org';
const ENQUIRY_FROM = 'info@phoenixbasildonsc.org';
// Sites allowed to post to this script (stops other websites using it to send email)
const ALLOWED_HOSTS = ['basildonswimming.org', 'www.basildonswimming.org',
                       'basildonswimmingclub.co.uk', 'www.basildonswimmingclub.co.uk'];
const MAX_PER_HOUR = 5; // enquiries per visitor (IP address) per hour

date_default_timezone_set('Europe/London');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function reply($status, $data) {
  http_response_code($status);
  echo json_encode($data);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  header('Allow: POST');
  reply(405, ['ok' => false, 'error' => 'Use the form on the Join Us page.']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
  $host = strtolower((string) parse_url($origin, PHP_URL_HOST));
  if (!in_array($host, ALLOWED_HOSTS, true)) {
    reply(403, ['ok' => false, 'error' => 'Not allowed.']);
  }
}

// Hidden "website" box: people never see it, spam bots fill it in. Pretend it worked.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
  reply(200, ['ok' => true, 'skipped' => true]); // "skipped": the page doesn't keep a record either
}

/* One line of text: no line breaks or control characters, limited length. */
function field($name, $max = 120) {
  $v = (string) ($_POST[$name] ?? '');
  $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v);
  if ($v === null) return ''; // not valid UTF-8
  $v = trim(preg_replace('/\s+/u', ' ', $v));
  return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
}
/* The free-text box: keeps line breaks. */
function notes() {
  $v = str_replace(["\r\n", "\r"], "\n", (string) ($_POST['notes'] ?? ''));
  $v = preg_replace('/[\x00-\x09\x0B-\x1F\x7F]+/u', ' ', $v);
  if ($v === null) return '';
  $v = trim(preg_replace("/\n{3,}/", "\n\n", $v));
  return function_exists('mb_substr') ? mb_substr($v, 0, 3000) : substr($v, 0, 3000);
}

$paths = [
  'lessons'     => 'Academy (swim lesson stage)',
  'competitive' => 'Competitive swimmer (squad trial)',
  'masters'     => 'Masters',
];
$path = field('path', 20);
if (!isset($paths[$path])) reply(400, ['ok' => false, 'error' => 'Please choose a pathway and try again.']);

$email   = field('email', 200);
$swimmer = field('swimmer');
$parent  = field('parent');
$dob     = field('dob', 10);
$notes   = notes();

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) reply(400, ['ok' => false, 'error' => 'Please check your email address.']);
if ($swimmer === '') reply(400, ['ok' => false, 'error' => 'Please fill in the swimmer\'s name.']);

$rows = [];
if ($path === 'masters') {
  $rows['Name'] = $swimmer;
  $rows['Email'] = $email;
} else {
  if ($parent === '') reply(400, ['ok' => false, 'error' => 'Please fill in the parent / guardian name.']);
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) reply(400, ['ok' => false, 'error' => 'Please fill in the swimmer\'s date of birth.']);
  list($y, $m, $d) = array_map('intval', explode('-', $dob));
  $rows['Parent / guardian'] = $parent;
  $rows['Email'] = $email;
  $rows['Swimmer'] = $swimmer;
  $rows['Date of birth'] = sprintf('%02d/%02d/%04d', $d, $m, $y);
  if ($path === 'lessons') {
    $rows['Swim lesson stage'] = field('stage', 20);
  } else {
    $se = field('seNo', 20);
    if ($se === '') reply(400, ['ok' => false, 'error' => 'Please fill in the Swim England number.']);
    $rows['Swim England number'] = $se;
    $rows['Current level'] = field('level', 40);
  }
}

// Simple flood guard, kept in the server's temp folder. If that folder can't be used,
// enquiries still go through.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$stamp = rtrim(sys_get_temp_dir(), '/\\') . '/bpsc-enquiry-' . md5($ip . '|bpsc');
$now = time();
$recent = [];
$saved = @file_get_contents($stamp);
if ($saved !== false) {
  foreach (explode(',', $saved) as $t) {
    if ((int) $t > $now - 3600) $recent[] = (int) $t;
  }
}
if (count($recent) >= MAX_PER_HOUR) {
  reply(429, ['ok' => false, 'error' => 'Too many enquiries from here in the last hour.']);
}

$body = "New Join Us enquiry from the club website\n\n"
      . "Pathway: {$paths[$path]}\n";
foreach ($rows as $label => $value) $body .= "$label: $value\n";
$body .= "\nAnything else we should know?\n" . ($notes !== '' ? $notes : '(nothing added)') . "\n\n"
      . "--\nSent from the Join Us page at https://basildonswimming.org/join on " . date('d/m/Y H:i') . ".\n"
      . "Press Reply to answer $email directly.\n";

$subject = "Join Us enquiry: {$paths[$path]} - $swimmer";
$headers = implode("\r\n", [
  'From: "BPSC Website" <' . ENQUIRY_FROM . '>',
  'Reply-To: ' . $email,
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
  'X-Mailer: BPSC website',
]);

$sent = @mail(ENQUIRY_TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-f' . ENQUIRY_FROM);
if (!$sent) {
  reply(502, ['ok' => false, 'error' => 'The email could not be sent.']);
}

$recent[] = $now;
@file_put_contents($stamp, implode(',', $recent), LOCK_EX);
reply(200, ['ok' => true]);
