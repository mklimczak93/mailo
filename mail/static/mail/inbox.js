
// --- MAIN --- //

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});



// --- COMPOSING EMAIL --- //

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#chosen-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



// --- VIEW EMAIL --- //

function view_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Show the mailbox and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#chosen-email').style.display = 'block';

      //Getting contents of email (subject, recipients, body, sender)
      document.querySelector('#chosen-email').innerHTML =
      `
      <div class="detailed-email">
        <div class="detailed-heading">
            <div class="photo-mockup">
            </div>

            <div class="text-heading">
                <h6>From: ${email.sender}</h6>
                <h6>To: ${email.recipients}</h6>
                <h6>Subject: ${email.subject}</h6>
                <h6>Sent on: ${email.timestamp}</h6>
            </div>

            <div class="heading-buttons" style="margin-left:auto;">
                <button type="button" class="btn-view" id="archive-button">
                    <i class="fa-solid fa-box-archive" style="margin-right:5px;"></i>
                    Archive
                </button>
                <button type="button" class="btn-view" id="reply-button">
                    <i class="fa-solid fa-reply" style="margin-right:5px;"></i>
                    Reply
                </button>
            </div>

          </div>
          <div class="view-body">
            <p>${email.body}</p>
          </div>
        </div>
      `

      // --- CHANGING READ STATUS --- //
      if (!email.read){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }

      // --- CHANGING ARCHIVE STATUS --- //
      const archivebutton = document.querySelector('#archive-button')
      if (!email.archived) {
        archivebutton.innerHTML =
        `
        <i class="fa-solid fa-box-archive" style="margin-right:5px;"></i>
        Archive
        `
      } else {
        archivebutton.innerHTML =
        `
        <i class="fa-solid fa-folder-open" style="margin-right:5px;"></i>
        Unarchive
        `
      }

      archivebutton.onclick = function () {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then (() => {load_mailbox('archive')})
      };

      // --- REPLING --- //
      const replybutton = document.querySelector('#reply-button');
      replybutton.onclick = function () {
        // Show compose view and hide other views
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'block';
        document.querySelector('#chosen-email').style.display = 'none';
        // Prefill the composition fields
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        document.querySelector('#compose-body').value =
        `
        \n\n
        \n------------------------------------
        \nOn ${email.timestamp} ${email.sender} wrote:
        \n ${email.body}
        `;

        }

  });
  }



function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#chosen-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Get e-mails in mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(emailE => {
        console.log(emailE);
        //Creating divs
        const element = document.createElement('div');

        //giving the div a class
        element.className = "mail_preview"
        element.innerHTML =
        `
        <div class="email">
            <div class="photo-mockup">
            </div>
            <div class="text-email">
                <div class="mail-heading">
                    <h5>From: ${emailE.sender}</h5>
                    <div class="heading-buttons">
                        <button type="button" class="btn-view" id="view-mockup">
                            <i class="fa-solid fa-expand" style="margin-right:5px;"></i>
                            View
                        </button>
                    </div>
                </div>
                <h6>Subject: ${emailE.subject}</h6>
                <h6>Sent on: ${emailE.timestamp}</h6>
            </div>
        </div>
        `
        ;

        //changing background
        if (emailE.read) {
          element.className = "read";
        } else {
          element.className = "unread";
        }


        //clicking
        element.addEventListener('click', function() {
          view_email(emailE.id)
        });
        document.querySelector('#emails-view').append(element);
      })
  });

  }

function send_email(event) {
  event.preventDefault();

  const recipients  = document.querySelector('#compose-recipients').value;
  const subject     = document.querySelector('#compose-subject').value;
  const body        = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    });
}




