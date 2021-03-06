define(["app", "apps/contacts/list/list_view"], function(ContactManager, View){
  ContactManager.module("ContactsApp.List", function(List, ContactManager, Backbone, Marionette, $, _){
    List.Controller = {
      listContacts: function(criterion){
        require(["common/views", "entities/contact"], function(CommonViews){
          var loadingView = new CommonViews.Loading();
          ContactManager.mainRegion.show(loadingView);

          var fetchingContacts = ContactManager.request("contact:entities");

          var contactsListLayout = new View.Layout();
          var contactsListPanel = new View.Panel();

          require(["entities/common"], function(FilteredCollection){
            $.when(fetchingContacts).done(function(contacts){
              var filteredContacts = ContactManager.Entities.FilteredCollection({
                collection: contacts,
                filterFunction: function(filterCriterion){
                  var criterion = filterCriterion.toLowerCase();
                  
                  return function (contact){
                    
                    if(contact.get('firstName').toLowerCase().indexOf(criterion) != -1 || contact.get('lastName').toLowerCase().indexOf(criterion) != -1){
                      return contact;
                    }
                   
                    // = à :

                    // var firstName = contact.get('firstName').toLowerCase();
                    // var okFirstName = firstName.indexOf(criterion);
                   
                    // var lastName = contact.get('lastName').toLowerCase(); //contact.attributes.lastName.toLowerCase()
                    // var okLastName = lastName.indexOf(criterion);

                    // if(okFirstName == 0 || okLastName == 0){

                    //   return contact;
                    // }

                  }
                }
              });

              if(criterion){
                filteredContacts.filter(criterion);
                contactsListPanel.once("show", function(){
                  contactsListPanel.triggerMethod("set:filter:criterion", criterion);
                });
              }

              var contactsListView = new View.Contacts({
                collection: filteredContacts
              });

              contactsListPanel.on("contacts:filter", function(filterCriterion){
                filteredContacts.filter(filterCriterion);
                ContactManager.trigger("contacts:filter", filterCriterion);
              });

              contactsListLayout.on("show", function(){
                contactsListLayout.panelRegion.show(contactsListPanel);
                contactsListLayout.contactsRegion.show(contactsListView);
              });

              contactsListPanel.on("contact:new", function(){


                  //TODO
                  require(["apps/contacts/new/new_view"], function(NewView){
                    var newContact = ContactManager.request("contact:entity:new");
                    // creation instance à laquelle on passe le model
                    var view = new NewView.Contact({
                      model:newContact
                    });

                    view.on("form:submit", function(data){

                      // récupére l'id max
                      var id_max = contacts.max(function(c){return c.id}).get('id');

                      data.id = id_max +1; // objet
                      newContact.save(data); // newContact = model
                      
                      contacts.add(data);

                      view.trigger("dialog:close");

                    });


                    // affichage du popup
                    ContactManager.dialogRegion.show(view); 

                  });
                  console.log('code to add a new contact');

                  // id max du localStorage
              });

              contactsListView.on("itemview:contact:edit", function(childView, model){
                require(["apps/contacts/edit/edit_view"], function(EditView){
                  var view = new EditView.Contact({
                    model: model
                  });

                  view.on("form:submit", function(data){
                    console.log('I should save the data on the serve')
                  });

                  ContactManager.dialogRegion.show(view);
                });
              });

              contactsListView.on("itemview:contact:delete", function(childView, model){
                model.destroy();
              });


              ContactManager.mainRegion.show(contactsListLayout);
            });
          });
        });
      }
    }
  });

  return ContactManager.ContactsApp.List.Controller;
});
