export function createDeleteConfirmForm() {
  return new Promise((resolve) => {
    let deleteConfirm = document.createElement("div");
    deleteConfirm.id = "delete-confirm";
    deleteConfirm.className = "";

    let deleteConfirmClose = document.createElement("span");
    deleteConfirmClose.id = "delete-confirm-close";
    deleteConfirmClose.className = "close";

    let deleteConfirmText = document.createElement("p");
    deleteConfirmText.textContent = "ユーザー情報を本当に削除しますか？";

    let buttonWrapper = document.createElement("div");
    buttonWrapper.className = "buttonWrapper";

    let deleteCancelButton = document.createElement("button");
    deleteCancelButton.id = "delete-cancel-button";
    deleteCancelButton.textContent = "キャンセル";

    let deleteConfirmButton = document.createElement("button");
    deleteConfirmButton.id = "delete-confirm-button";
    deleteConfirmButton.textContent = "削除";

    buttonWrapper.appendChild(deleteCancelButton);
    buttonWrapper.appendChild(deleteConfirmButton);

    deleteConfirm.appendChild(deleteConfirmClose);
    deleteConfirm.appendChild(deleteConfirmText);
    deleteConfirm.appendChild(buttonWrapper);

    document.getElementById("delete-confirm-area").appendChild(deleteConfirm);

    deleteConfirmClose.addEventListener("click", () => {
      deleteConfirm.classList.add("noDisp");
      resolve(false);
    });

    deleteCancelButton.addEventListener("click", () => {
      deleteConfirm.classList.add("noDisp");
      resolve(false);
    });

    deleteConfirmButton.addEventListener("click", () => {
      deleteConfirm.classList.add("noDisp");
      resolve(true);
    });
  });
}




