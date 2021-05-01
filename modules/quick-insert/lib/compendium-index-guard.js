function loadGuard() {
  // Only add once
  if (Compendium.prototype.indexGuardResolve) return;

  // Save the original getIndex
  Compendium.prototype.__getIndex = Compendium.prototype.getIndex;

  // Resolve is called when the real getIndex resolves
  Compendium.prototype.indexGuardResolve = function (result) {
    const queued = this.indexGuardPending;
    delete this.indexGuardPending;
    queued.forEach(waiting => waiting.resolve(result));
  };

  // Reject is called when the real getIndex is rejected
  Compendium.prototype.indexGuardReject = function (reason) {
    const queued = this.indexGuardPending;
    delete this.indexGuardPending;
    queued.forEach(waiting => waiting.reject(reason));
  };

  // Replace getIndex with a batch queue thing
  Compendium.prototype.getIndex = async function () {
    if (this.indexGuardPending) {
      // There are indexing calls pending already
      return new Promise((resolve, reject) => {
        this.indexGuardPending.push({
          resolve,
          reject,
        });
      });
    }

    // There are no indexing calls pending
    this.indexGuardPending = [];
    const promise = new Promise((resolve, reject) => {
      this.indexGuardPending.push({
        resolve,
        reject,
      });
    });
    this.__getIndex
      .call(this)
      .then(result => this.indexGuardResolve(result))
      .catch(reason => this.indexGuardReject(reason));
    return promise;
  };
}
if (localStorage.getItem("IndexGuardEnabled")) {
  console.log("Quick Insert | Activating index guard");
  loadGuard();
}
