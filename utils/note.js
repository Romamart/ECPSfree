function note(text){

  let div = document.createElement('div');
  div.className = "ecpsfree-notification ecpsfree-js-notification";
  let create = `<div class="ecpsfree-container"><div class="ecpsfree-text">${text}</div><div class="ecpsfree-button">Okey</div></div>`;
  div.innerHTML = create;

  document.body.append(div);

  let panel = document.querySelector('.ecpsfree-js-notification'),
      panelButton = panel.querySelector('.ecpsfree-button');
  
  panelButton.addEventListener('click', function(){
    panel.classList.add('ecpsfree-hidden');
  })
};