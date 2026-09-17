# Angular Profiles & Roles Dashboard

A ready-to-copy Angular 19 module-based dashboard for the Node.js API in the supplied backend project.

## API base URL
Default: `http://localhost:3000`

Change it in:
`src/environments/environment.ts`

## APIs used

### Profiles
- GET `/profile/users`
- GET `/profile/users?roleId=2`
- POST `/profile/createuser`
- PUT `/profile/updateuser?id=10`

> The supplied Node project does not currently expose a profile DELETE endpoint. The UI includes the Delete button and expects `DELETE /profile/deleteuser?id=<id>`. Add the small backend route/controller shown below.

### Roles
- GET `/role/list`
- GET `/role/list?id=1`
- POST `/role/create`
- PUT `/role/update?id=1`
- DELETE `/role/delete?id=1`

## Required packages

This project uses Angular 19 + ng-bootstrap.

```bash
npm install
ng serve
```

If copying these files into an existing Angular application, install:

```bash
npm install @ng-bootstrap/ng-bootstrap bootstrap
```

and add Bootstrap CSS to `angular.json`.

## Backend profile delete

Add to `modules/profile/profile.routes.js`:

```js
router.delete('/deleteuser', profileController.deleteUser);
```

Add to `modules/profile/profile.controller.js`:

```js
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = Number(req.query.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return sendResponse(res, 400, 'User id is required', null);
        }

        const user = await Profile.findOne({ id: userId });

        if (!user) {
            return sendResponse(res, 404, 'User not found', null);
        }

        await Profile.deleteOne({ id: userId });

        return sendResponse(
            res,
            200,
            'User deleted successfully',
            null
        );
    } catch (error) {
        next(error);
    }
};
```
