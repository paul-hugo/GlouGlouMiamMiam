package glougloumiammiam;

import glougloumiammiam.PMF;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.users.User;
import com.google.appengine.api.oauth.OAuthRequestException;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.io.Console;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "productendpoint", namespace = @ApiNamespace(ownerDomain = "mycompany.com", ownerName = "mycompany.com", packagePath = "services"))
public class ProductEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listProduct")
	public CollectionResponse<Product> listProduct(@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Product> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(Product.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<Product>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Product obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Product> builder().setItems(execute).setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getProduct")
	public Product getProduct(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Product product = null;
		try {
			product = mgr.getObjectById(Product.class, id);
		} finally {
			mgr.close();
		}
		return product;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param product the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertProduct")
	public Product insertProduct(Product product, User user)
		throws OAuthRequestException, IOException
	{
		PersistenceManager mgr = getPersistenceManager();
		try {
			if(user != null && user.getEmail().equals(Ids.ADMIN_EMAIL)) {
				System.out.println(user.getEmail());
				if (containsProduct(product)) {
					throw new EntityExistsException("Object already exists");
				}
				mgr.makePersistent(product);
			} else {
				throw new OAuthRequestException(null);
			}
		} finally {
			mgr.close();
		}
		return product;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param product the entity to be updated.
	 * @param user to give
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateProduct", path="updateProduct")
	public Product updateProduct(Product product, User user)
		throws OAuthRequestException, IOException
	{
		PersistenceManager mgr = getPersistenceManager();
		try {
			if(user != null && user.getEmail().equals(Ids.ADMIN_EMAIL)) {
				if (!containsProduct(product)) {
					throw new EntityNotFoundException("Object does not exist");
				}
				mgr.makePersistent(product);
			} else {
				throw new OAuthRequestException(null);
			}
		} finally {
			mgr.close();
		}
		return product;
	}
	
	/**
	 * +1 sur le type à mettre à jour (glouglou ou miammiam)
	 * @param product
	 * @param type
	 * @return
	 */
	@ApiMethod(name = "updateGGMM",
			clientIds = {
					Ids.WEB_CLIENT_ID
			},
			audiences = { Ids.WEB_CLIENT_ID }, path="updateGGMM")
	public Product updateGGMM(Product product, @Named("type") String type)
	{
		PersistenceManager mgr = getPersistenceManager();
		try {
				Product p = containsProductObject(product);
				if (p == null) {
					throw new EntityNotFoundException("Object does not exist");
				}
				
				//System.out.println(p.getCommune());
				
				if(type.equals("miam")) {
					//System.out.println("miam");
					p.setMiammiam(p.getMiammiam()+1);
				} else {
					//System.out.println("glou");
					p.setGlouglou(p.getGlouglou()+1);
				}
				
				mgr.makePersistent(p);
		} finally {
			mgr.close();
		}
		return product;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeProduct")
	public void removeProduct(@Named("id") Long id, User user) 
		throws OAuthRequestException, IOException
	{
		PersistenceManager mgr = getPersistenceManager();
		try {
			if(user != null && user.getEmail().equals(Ids.ADMIN_EMAIL)) {
				Product product = mgr.getObjectById(Product.class, id);
				mgr.deletePersistent(product);
			} else {
				throw new OAuthRequestException(null);
			}
		} finally {
			mgr.close();
		}
	}

	private boolean containsProduct(Product product) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Product.class, product.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}
	
	
	private Product containsProductObject(Product product) {
		PersistenceManager mgr = getPersistenceManager();
//		boolean contains = true;
		Product p = null;
		try {
			p = mgr.getObjectById(Product.class, product.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
//			contains = false;
		} finally {
			mgr.close();
		}
		return p;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
