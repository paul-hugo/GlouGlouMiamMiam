package glougloumiammiam;

import javax.jdo.annotations.*;

@PersistenceCapable
public class Product {
	
	@PrimaryKey
	@Persistent(valueStrategy=IdGeneratorStrategy.IDENTITY)
	private Long id;
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String ci;
	@Persistent
	private String dpt;
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String commune;
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private int ida;
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String produit;
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private int glouglou;
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private int miammiam;
	
	// Constructeur pour Objectify
	//	public Product() {}

	public Product(Long id, String ci, String dpt, String commune, int ida, String produit, int glouglou, int miammiam) {
		super();
		this.id = id;
		this.ci = ci;
		this.dpt = dpt;
		this.commune = commune;
		this.ida = ida;
		this.produit = produit;
		this.glouglou = glouglou;
		this.miammiam = miammiam;
	}
	
	public Long getId() {
		return id;
	}
	public String getCi() {
		return ci;
	}
	public String getDpt() {
		return dpt;
	}
	public String getCommune() {
		return commune;
	}
	public int getIda() {
		return ida;
	}
	public String getProduit() {
		return produit;
	}
	public int getGlouglou() {
		return glouglou;
	}

	public int getMiammiam() {
		return miammiam;
	}
	
	
	public void setId(Long id) {
		this.id = id;
	}
	public void setCi(String ci) {
		this.ci = ci;
	}
	public void setDpt(String dpt) {
		this.dpt = dpt;
	}
	public void setCommune(String commune) {
		this.commune = commune;
	}
	public void setIda(int ida) {
		this.ida = ida;
	}
	public void setProduit(String produit) {
		this.produit = produit;
	}
	public void setGlouglou(int glouglou) {
		this.glouglou = glouglou;
	}

	public void setMiammiam(int miammiam) {
		this.miammiam = miammiam;
	}
	
	
}
