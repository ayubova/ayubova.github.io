$(document).ready(function() {
    $('#searchUser').on('keyup', function(e){
        let username = e.target.value;
   

    // Make request to Github

    $.ajax({
        url: `https://api.github.com/users/${username}`,
        data: {
            client_id: '7156eae2412cbbab9a4b',
            client_secret: 'bceab2867f8b0b157ec59843072bee5fdc03bc5a'
        }
    }).done(function(user){
        const delNulls = obj => Object.keys(obj).reduce((acc, key) => (acc[key] === null && typeof acc[key] === "object") || acc[key] === '' ? { ...acc, [key]: 'No data' } : acc, obj);
        
        $.ajax({
        url: `https://api.github.com/users/${username}/repos`,
        data: {
            client_id: '7156eae2412cbbab9a4b',
            client_secret: 'bceab2867f8b0b157ec59843072bee5fdc03bc5a',
            sort: 'created: asc',
            per_page: 5
        }
      }).done(function(repos){
        $.each(repos, function(index, repo){
            
            const newRepo = delNulls(repo);
            $('#repos').append(`
              <div class="well">
                <div class="row">
                  <div class="col-md-7">
                    <strong>${newRepo.name}</strong>: ${newRepo.description}
                  </div>
                  <div class="col-md-3">
                    <span class="badge badge-light">Forks: ${newRepo.forks_count}</span>
                    <span class="badge badge-primary">Watchers: ${newRepo.watchers_count}</span>
                    <span class="badge badge-success">Stars: ${newRepo.stargazers_count}</span>
                  </div>
                  <div class="col-md-2">
                    <a href="${newRepo.html_url}" target="_blank" class="btn btn-secondary">Repo Page</a>
                  </div>
                </div>
              </div>
            `);
        })
      });
     
      const newUser = delNulls(user);

     $('#profile').html(`
        <div class="panel panel-default">
            <div class="panel-heading">
            <h3 class="panel-title">${newUser.name}</h3>
            </div>
            <div class="panel-body">
            <div class="row">
                <div class="col-md-3">
                    <img class="thumbnail avatar" src="${newUser.avatar_url}">
                    <a target="_blank" class="btn btn-primary btn-block" href="${newUser.html_url}">View Profile</a>
                </div>
                <div class="col-md-9">
              <span class="badge badge-light">Public Repos: ${newUser.public_repos}</span>
              <span class="badge badge-primary">Public Gists: ${newUser.public_gists}</span>
              <span class="badge badge-success">Followers: ${newUser.followers}</span>
              <span class="badge badge-info">Following: ${newUser.following}</span>
              <br><br>
              <ul class="list-group">
                <li class="list-group-item">Company: ${newUser.company}</li>
                <li class="list-group-item">Website/blog: ${newUser.blog}</li>
                <li class="list-group-item">Location: ${newUser.location}</li>
                <li class="list-group-item">Member Since: ${newUser.created_at.slice(0, 10)}</li>
              </ul>
              </div>
            </div>
          </div>
        </div>
        <h3 class="page-header">Latest Repos</h3>
        <div id="repos"></div>
     `);
    });

});
});